from __future__ import annotations

import csv
import json
import re
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from statistics import mean
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SOURCE_CSV = ROOT / 'data' / 'source' / 'participants.csv'
OUTPUT_JSON = ROOT / 'data' / 'demo-data.json'

GROUPS: dict[str, list[str]] = {
    'A': ['Mexico', 'Sudafrica', 'Corea', 'Irlanda'],
    'B': ['Canada', 'Italia', 'Qatar', 'Suiza'],
    'C': ['Brasil', 'Marruecos', 'Haiti', 'Escocia'],
    'D': ['USA', 'Paraguay', 'Australia', 'Turquia'],
    'E': ['Alemania', 'Curazao', 'CostaMarfil', 'Ecuador'],
    'F': ['Holanda', 'Japon', 'Suecia', 'Tunez'],
    'G': ['Belgica', 'Egipto', 'Iran', 'NuevaZelanda'],
    'H': ['Espana', 'CaboVerde', 'ArabiaSaudi', 'Uruguay'],
    'I': ['Francia', 'Senegal', 'Bolivia', 'Noruega'],
    'J': ['Argentina', 'Argelia', 'Austria', 'Jordania'],
    'K': ['Portugal', 'Jamaica', 'Uzbekistan', 'Colombia'],
    'L': ['Inglaterra', 'Croacia', 'Ghana', 'Panama'],
}

STAGE_SLOT_COUNTS = {
    'dieciseisavos': 32,
    'octavos': 16,
    'cuartos': 8,
    'semis': 4,
    'final': 2,
}

STAGE_COLUMN_MAP = {
    'dieciseisavos': 'EquipoR32',
    'octavos': 'EquipoOctavos',
    'cuartos': 'EquipoCuartos',
    'semis': 'EquipoSemis',
    'final': 'EquipoFinal',
}

SPECIAL_FIELDS = [
    ('MejorJugador', 'Mejor Jugador'),
    ('MejorJugadorJoven', 'Mejor jugador joven'),
    ('MejorPortero', 'Mejor portero'),
    ('MaximoGoleador', 'Máximo goleador'),
    ('MaximoAsistente', 'Máximo asistente'),
    ('MaximoGoleadorESP', 'Máximo goleador español'),
    ('PrimerGolESP', 'Primer goleador español'),
    ('SeleccionRevelacion', 'Selección revelación'),
    ('SeleccionDecepcion', 'Selección decepción'),
    ('MinutoPrimerGol', 'Minuto primer gol del Mundial'),
]

TEAM_TO_GROUP = {team: group for group, teams in GROUPS.items() for team in teams}
TOURNAMENT_START = datetime(2026, 6, 11, 19, 0, tzinfo=timezone.utc)


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r'[^a-z0-9]+', '-', value)
    value = re.sub(r'-{2,}', '-', value).strip('-')
    return value or 'item'


def parse_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open(encoding='utf-8', newline='') as handle:
        reader = csv.DictReader(handle)
        return reader.fieldnames or [], list(reader)


def parse_match_key(raw_key: str, group: str) -> tuple[str, str]:
    teams = GROUPS[group]
    for home in sorted(teams, key=len, reverse=True):
        if not raw_key.startswith(home):
            continue
        away_token = raw_key[len(home):]
        for away in sorted(teams, key=len, reverse=True):
            if away != home and away_token == away:
                return home, away
    raise ValueError(f'No se pudo descomponer el partido {raw_key!r} del grupo {group}')


def sign_from_score(score: str) -> str:
    home, away = [int(part) for part in score.split('-')]
    if home > away:
        return '1'
    if home < away:
        return '2'
    return 'X'


def build_group_match_definitions(fieldnames: list[str]) -> list[dict[str, Any]]:
    match_keys = [name[:-4] for name in fieldnames if name.endswith('_RTO')]
    definitions: list[dict[str, Any]] = []
    groups_in_order = list(GROUPS.keys())
    for index, raw_key in enumerate(match_keys):
        group = groups_in_order[index // 6]
        home, away = parse_match_key(raw_key, group)
        local_index = index % 6
        jornada = 1 if local_index < 2 else 2 if local_index < 4 else 3
        kickoff = TOURNAMENT_START + timedelta(hours=index * 4)
        definitions.append(
            {
                'id': f'fixture-{slugify(raw_key)}',
                'key': raw_key,
                'group': group,
                'jornada': jornada,
                'homeTeam': home,
                'awayTeam': away,
                'kickoff': kickoff.isoformat().replace('+00:00', 'Z'),
            }
        )
    return definitions


def choose_consensus_score(rows: list[dict[str, str]], key: str) -> str:
    counter = Counter(row[f'{key}_RTO'] for row in rows if row.get(f'{key}_RTO'))
    score, _ = sorted(counter.items(), key=lambda item: (-item[1], item[0]))[0]
    return score


def build_actual_group_orders(rows: list[dict[str, str]]) -> dict[str, list[str]]:
    actual_orders: dict[str, list[str]] = {}
    for group, teams in GROUPS.items():
        ranking: list[tuple[float, int, int, int, str]] = []
        for team in teams:
            column = f'g{group}_{team}_POS'
            positions = [int(row[column]) for row in rows if row.get(column)]
            ranking.append(
                (
                    mean(positions),
                    -sum(1 for position in positions if position == 1),
                    -sum(1 for position in positions if position == 2),
                    -sum(1 for position in positions if position == 3),
                    team,
                )
            )
        ranking.sort(key=lambda item: (item[0], item[1], item[2], item[3], item[4]))
        actual_orders[group] = [item[4] for item in ranking]
    return actual_orders


def stage_pick_block(row: dict[str, str]) -> dict[str, list[dict[str, Any]]]:
    stages: dict[str, list[dict[str, Any]]] = {}
    for stage, prefix in STAGE_COLUMN_MAP.items():
        slots: list[dict[str, Any]] = []
        for slot_index in range(1, STAGE_SLOT_COUNTS[stage] + 1):
            key = f'{prefix}_{slot_index}'
            slots.append(
                {
                    'slot': slot_index,
                    'team': row.get(key) or None,
                    'points': None,
                    'status': 'pending',
                }
            )
        stages[stage] = slots
    return stages


def podium_block(row: dict[str, str]) -> dict[str, Any]:
    return {
        'thirdPlace': {'team': row.get('TercerPuesto') or None, 'points': None, 'status': 'pending'},
        'subChampion': {'team': row.get('Subcampeon') or None, 'points': None, 'status': 'pending'},
        'champion': {'team': row.get('Campeon') or None, 'points': None, 'status': 'pending'},
    }


def special_block(row: dict[str, str]) -> list[dict[str, Any]]:
    return [
        {
            'key': key,
            'label': label,
            'value': row.get(key) or None,
            'points': None,
            'status': 'pending',
        }
        for key, label in SPECIAL_FIELDS
    ]


def assign_users(team_records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    users: list[dict[str, Any]] = []
    capacities = [3] * 10 + [2] * 10
    user_ids: list[str] = []
    for index, capacity in enumerate(capacities, start=1):
        user_id = f'user-{index:02d}'
        user_ids.extend([user_id] * capacity)
        users.append(
            {
                'id': user_id,
                'handle': f'@usuario{index:02d}',
                'password': 'mundial2026',
                'teamIds': [],
                'favorites': [],
                'versusPreferences': {
                    'mode': 'general' if index % 2 else 'participant',
                    'filter': 'all',
                    'tab': 'resumen',
                    'rivalTeamId': None,
                },
            }
        )
    user_lookup = {user['id']: user for user in users}
    for team_record, user_id in zip(team_records, user_ids, strict=True):
        team_record['userId'] = user_id
        team_record['ownerHandle'] = user_lookup[user_id]['handle']
        user_lookup[user_id]['teamIds'].append(team_record['id'])
    return users


def add_ranks(team_records: list[dict[str, Any]]) -> None:
    team_records.sort(key=lambda item: (-item['totalPoints'], -item['matchPoints'], item['name']))
    current_rank = 0
    previous_total = None
    for index, record in enumerate(team_records, start=1):
        if previous_total is None or record['totalPoints'] != previous_total:
            current_rank = index
            previous_total = record['totalPoints']
        record['currentRank'] = current_rank


def build_knockout_fixtures() -> dict[str, list[dict[str, Any]]]:
    stages: dict[str, list[dict[str, Any]]] = {}

    round_32_pairs = [
        ('1A', '3CDE'),
        ('2B', '2F'),
        ('1C', '3ABJ'),
        ('2D', '2H'),
        ('1E', '3ABCD'),
        ('2F', '2B'),
        ('1G', '3HIJ'),
        ('2H', '2D'),
        ('1I', '3EFG'),
        ('2J', '2L'),
        ('1K', '3FGH'),
        ('2L', '2J'),
        ('1B', '3IKL'),
        ('2A', '2C'),
        ('1D', '3EFJ'),
        ('2G', '2I'),
    ]
    octavos_pairs = [('G74', 'G75'), ('G76', 'G77'), ('G78', 'G79'), ('G80', 'G81'), ('G82', 'G83'), ('G84', 'G85'), ('G86', 'G87'), ('G88', 'G89')]
    cuartos_pairs = [('G90', 'G91'), ('G92', 'G93'), ('G94', 'G95'), ('G96', 'G97')]
    semis_pairs = [('G98', 'G99'), ('G100', 'G101')]
    final_pair = [('Ganador 101', 'Ganador 102')]
    third_pair = [('Perdedor 101', 'Perdedor 102')]

    base = TOURNAMENT_START + timedelta(days=16)

    def stage_fixture(stage_key: str, round_label: str, seq: int, home: str, away: str, kickoff: datetime) -> dict[str, Any]:
        return {
            'id': f'{stage_key}-{seq}',
            'stage': stage_key,
            'roundLabel': round_label,
            'group': None,
            'homeTeam': home,
            'awayTeam': away,
            'status': 'scheduled',
            'kickoff': kickoff.isoformat().replace('+00:00', 'Z'),
            'minute': None,
            'score': {'home': None, 'away': None},
            'goals': [],
            'eventsAvailable': False,
        }

    stages['dieciseisavos'] = [
        stage_fixture('dieciseisavos', 'Dieciseisavos de Final', index + 1, home, away, base + timedelta(hours=index * 4))
        for index, (home, away) in enumerate(round_32_pairs)
    ]
    stages['octavos'] = [
        stage_fixture('octavos', 'Octavos de Final', index + 1, home, away, base + timedelta(days=4, hours=index * 4))
        for index, (home, away) in enumerate(octavos_pairs)
    ]
    stages['cuartos'] = [
        stage_fixture('cuartos', 'Cuartos de Final', index + 1, home, away, base + timedelta(days=8, hours=index * 5))
        for index, (home, away) in enumerate(cuartos_pairs)
    ]
    stages['semis'] = [
        stage_fixture('semis', 'Semifinales', index + 1, home, away, base + timedelta(days=12, hours=index * 24))
        for index, (home, away) in enumerate(semis_pairs)
    ]
    stages['thirdPlace'] = [
        stage_fixture('thirdPlace', 'Tercer y Cuarto Puesto', 1, third_pair[0][0], third_pair[0][1], base + timedelta(days=14, hours=20))
    ]
    stages['final'] = [
        stage_fixture('final', 'Final', 1, final_pair[0][0], final_pair[0][1], base + timedelta(days=15, hours=20))
    ]
    return stages


def build_dataset() -> dict[str, Any]:
    fieldnames, rows = parse_csv(SOURCE_CSV)
    match_definitions = build_group_match_definitions(fieldnames)
    actual_scores = {definition['key']: choose_consensus_score(rows, definition['key']) for definition in match_definitions}
    actual_group_orders = build_actual_group_orders(rows)

    fixtures: list[dict[str, Any]] = []
    for definition in match_definitions:
        score = actual_scores[definition['key']]
        home_goals, away_goals = [int(part) for part in score.split('-')]
        fixtures.append(
            {
                'id': definition['id'],
                'key': definition['key'],
                'stage': 'groups',
                'roundLabel': f'Fase de grupos - Jornada {definition["jornada"]}',
                'group': definition['group'],
                'homeTeam': definition['homeTeam'],
                'awayTeam': definition['awayTeam'],
                'status': 'finished',
                'kickoff': definition['kickoff'],
                'minute': 90,
                'score': {'home': home_goals, 'away': away_goals},
                'goals': [],
                'eventsAvailable': False,
            }
        )

    team_records: list[dict[str, Any]] = []
    for row in rows:
        match_picks: list[dict[str, Any]] = []
        exact_hits = 0
        sign_hits = 0
        misses = 0
        double_hits = 0
        double_signs = 0
        match_points = 0

        for definition in match_definitions:
            predicted_score = row.get(f'{definition["key"]}_RTO') or '0-0'
            predicted_sign = row.get(f'{definition["key"]}_1X2') or sign_from_score(predicted_score)
            is_double = str(row.get(f'{definition["key"]}_DOB') or '').strip().lower() == 'true'
            actual_score = actual_scores[definition['key']]
            actual_sign = sign_from_score(actual_score)

            if predicted_score == actual_score:
                status = 'exact'
                points = 10 if is_double else 5
                exact_hits += 1
                if is_double:
                    double_hits += 1
            elif predicted_sign == actual_sign:
                status = 'sign'
                points = 4 if is_double else 2
                sign_hits += 1
                if is_double:
                    double_signs += 1
            else:
                status = 'miss'
                points = 0
                misses += 1

            match_points += points
            match_picks.append(
                {
                    'id': definition['id'],
                    'key': definition['key'],
                    'group': definition['group'],
                    'jornada': definition['jornada'],
                    'homeTeam': definition['homeTeam'],
                    'awayTeam': definition['awayTeam'],
                    'predictedScore': predicted_score,
                    'predictedSign': predicted_sign,
                    'actualScore': actual_score,
                    'actualSign': actual_sign,
                    'isDouble': is_double,
                    'points': points,
                    'status': status,
                }
            )

        groups_block: list[dict[str, Any]] = []
        group_points_total = 0
        for group, teams in GROUPS.items():
            actual_order = actual_group_orders[group]
            actual_positions = {team: index + 1 for index, team in enumerate(actual_order)}
            group_rows: list[dict[str, Any]] = []
            group_points = 0
            for team in teams:
                predicted_position = int(row[f'g{group}_{team}_POS'])
                predicted_points = int(row[f'g{group}_{team}_PTOS'])
                actual_position = actual_positions[team]
                status = 'hit' if predicted_position == actual_position else 'miss'
                points = 1 if status == 'hit' else 0
                group_points += points
                group_rows.append(
                    {
                        'team': team,
                        'predictedPosition': predicted_position,
                        'predictedPoints': predicted_points,
                        'actualPosition': actual_position,
                        'points': points,
                        'status': status,
                    }
                )
            group_points_total += group_points
            groups_block.append(
                {
                    'group': group,
                    'points': group_points,
                    'actualOrder': actual_order,
                    'positions': sorted(group_rows, key=lambda item: item['predictedPosition']),
                }
            )

        team_records.append(
            {
                'id': f'team-{slugify(row["Participante"])}',
                'name': row['Participante'],
                'userId': None,
                'ownerHandle': None,
                'currentRank': None,
                'totalPoints': match_points + group_points_total,
                'matchPoints': match_points,
                'groupPoints': group_points_total,
                'finalPhasePoints': 0,
                'specialPoints': 0,
                'championPick': row.get('Campeon') or None,
                'summary': {
                    'exactHits': exact_hits,
                    'signHits': sign_hits,
                    'misses': misses,
                    'doubleHits': double_hits,
                    'doubleSigns': double_signs,
                },
                'picks': {
                    'matches': match_picks,
                    'groups': groups_block,
                    'eliminatorias': stage_pick_block(row),
                    'podium': podium_block(row),
                    'specials': special_block(row),
                },
            }
        )

    add_ranks(team_records)
    users = assign_users(team_records)

    ranking_snapshot = [
        {
            'teamId': record['id'],
            'teamName': record['name'],
            'ownerHandle': record['ownerHandle'],
            'totalPoints': record['totalPoints'],
            'currentRank': record['currentRank'],
        }
        for record in team_records
    ]

    dataset = {
        'meta': {
            'source': 'demo-consensus-groups',
            'generatedAt': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            'scoredThrough': 'group-stage',
            'tournamentProgress': {
                'groups': 'complete',
                'knockout': 'pending',
                'specials': 'pending',
            },
            'credentials': {
                'password': 'mundial2026',
                'note': 'Usuario demo compartido para handles @usuario01..@usuario20',
            },
        },
        'groups': GROUPS,
        'actualGroupOrders': actual_group_orders,
        'fixtures': {
            'groups': fixtures,
            'knockout': build_knockout_fixtures(),
        },
        'ranking': ranking_snapshot,
        'users': users,
        'teams': team_records,
    }
    return dataset


def main() -> None:
    dataset = build_dataset()
    OUTPUT_JSON.write_text(json.dumps(dataset, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Escrito {OUTPUT_JSON}')
    print('Top 5:')
    for item in dataset['ranking'][:5]:
        print(item)


if __name__ == '__main__':
    main()
