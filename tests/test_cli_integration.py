import sys
import os
import subprocess
import json

import pytest

def test_cli_integration(tmp_path, monkeypatch):
    # Paths to scripts
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
    init_db_script = os.path.join(project_root, 'initialize_database.py')
    exam_init_script = os.path.join(project_root, 'exam_init.py')

    # Copy the prompts directory into tmp_path for exam_init
    import shutil
    src_prompts = os.path.join(project_root, 'prompts')
    dst_prompts = os.path.join(str(tmp_path), 'prompts')
    shutil.copytree(src_prompts, dst_prompts)
    # Run database initializations in tmp_path
    subprocess.run([sys.executable, init_db_script], cwd=str(tmp_path), check=True)
    subprocess.run([sys.executable, exam_init_script], cwd=str(tmp_path), check=True)

    # Prepare CLI inputs: for three tasks, prompt and evaluation notes
    # 1. factorial
    # 2. sort array
    # 3. sql top 5
    user_input = '\n'.join([
        'factorial', 'ok1',
        'sort array', 'ok2',
        'sql top 5', 'ok3',
    ]) + '\n'

    # Run CLI
    # Run CLI with PYTHONPATH set to project_root so promptcraft package is found
    env = os.environ.copy()
    env['PYTHONPATH'] = project_root
    result = subprocess.run(
        [sys.executable, '-m', 'promptcraft.cli', '--candidate', 'testcand'],
        cwd=str(tmp_path),
        input=user_input,
        text=True,
        capture_output=True,
        env=env,
    )
    # CLI should exit cleanly
    assert result.returncode == 0, result.stderr

    # Verify candidate_submissions directory
    subs_dir = tmp_path / 'candidate_submissions'
    assert subs_dir.exists() and subs_dir.is_dir()
    subs_files = list(subs_dir.iterdir())
    assert len(subs_files) == 3

    # Verify evaluation_results directory
    eval_dir = tmp_path / 'evaluation_results'
    assert eval_dir.exists() and eval_dir.is_dir()
    eval_files = list(eval_dir.glob('eval_testcand_task*.json'))
    assert len(eval_files) == 3

    # Check one evaluation file content
    data = json.load(open(eval_files[0]))
    assert data['candidate_id'] == 'testcand'
    assert 'evaluation_notes' in data
    assert data['evaluation_notes'] in ['ok1', 'ok2', 'ok3']