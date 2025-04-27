import os
from promptcraft.tasks.task_handler import TaskHandler

def test_record_submission(tmp_path, capsys):
    # Setup TaskHandler with custom output directory
    out_dir = tmp_path / "subs"
    th = TaskHandler(output_dir=str(out_dir))
    # Perform record_submission
    candidate = "bob"
    task_id = 42
    prompt = "test prompt"
    code = "print('hi')"
    filename = th.record_submission(candidate, task_id, prompt, generated_code=code)
    # Check that file exists and contains expected content
    assert os.path.exists(filename)
    content = open(filename).read()
    assert f"Candidate ID: {candidate}" in content
    assert f"Task ID: {task_id}" in content
    assert prompt in content
    assert code in content
    # Check console output
    captured = capsys.readouterr()
    assert "Submission recorded in" in captured.out