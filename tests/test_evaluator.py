import os
import json
import shutil
import pytest

from promptcraft.evaluation.evaluator import Evaluator

@pytest.fixture
def eval_dir(tmp_path):
    d = tmp_path / "evals"
    return str(d)

def test_save_and_load_evaluation(eval_dir):
    # Ensure clean directory
    if os.path.exists(eval_dir):
        shutil.rmtree(eval_dir)
    ev = Evaluator(output_dir=eval_dir)
    # Prepare a dummy evaluation result
    evaluation_result = {
        "candidate_id": "c1",
        "task_id": 1,
        "evaluation_notes": "good",
        "scores": {"criterion": 5}
    }
    # Save evaluation
    ev._save_evaluation(evaluation_result)
    # Check file exists
    fname = os.path.join(eval_dir, "eval_c1_task1.json")
    assert os.path.exists(fname)
    # Load and compare
    loaded = json.load(open(fname))
    assert loaded == evaluation_result
    # Test get_candidate_evaluations
    results = ev.get_candidate_evaluations("c1")
    assert isinstance(results, list)
    assert len(results) == 1
    assert results[0]["candidate_id"] == "c1"