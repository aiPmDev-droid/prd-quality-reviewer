"""
API test for PRD Quality Reviewer.

This test verifies the API route works correctly.
Run with: python tests/test_api.py

Requires:
  - The Next.js dev server running on localhost:3000
  - GEMINI_API_KEY set in the environment or .env.local

Usage:
  npm run dev
  (in another terminal) python tests/test_api.py
"""

import json
import os
import sys
import urllib.request
import urllib.error

API_URL = "http://localhost:3000/api/review"
SAMPLE_PRDS_DIR = os.path.join(os.path.dirname(__file__), "..", "sample_prds")


def load_prd(filename: str) -> str:
    path = os.path.join(SAMPLE_PRDS_DIR, filename)
    with open(path, "r") as f:
        return f.read()


def test_review(prd_text: str, prd_name: str) -> dict | None:
    """Send a PRD to the review API and return the response."""
    payload = json.dumps({"prdText": prd_text}).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"\n=== {prd_name} ===")
            print(f"  Overall Score: {data.get('overall', 'ERROR')}/100")
            if "smart" in data:
                for criterion, detail in data["smart"].items():
                    print(f"  {criterion}: {detail['score']}/100")
            print(f"  Summary: {data.get('summary', 'N/A')}")
            return data
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"\n=== {prd_name} === ERROR {e.code}")
        print(f"  {body}")
        return None
    except Exception as e:
        print(f"\n=== {prd_name} === EXCEPTION: {e}")
        return None


def validate_response(data: dict | None) -> bool:
    """Validate the response contains expected fields."""
    if data is None:
        return False

    required = ["overall", "smart", "summary"]
    for key in required:
        if key not in data:
            print(f"  MISSING FIELD: {key}")
            return False

    smart_criteria = ["specific", "measurable", "achievable", "relevant", "timeBound"]
    for criterion in smart_criteria:
        if criterion not in data.get("smart", {}):
            print(f"  MISSING CRITERION: {criterion}")
            return False
        detail = data["smart"][criterion]
        for field in ["score", "reasoning", "suggestions"]:
            if field not in detail:
                print(f"  MISSING FIELD in {criterion}: {field}")
                return False

    return True


def main():
    """Run tests against all 5 sample PRDs."""
    prds = [
        ("prd_01_ecommerce_checkout.md", "E-Commerce Checkout"),
        ("prd_02_dashboard_analytics.md", "Dashboard Analytics (vague)"),
        ("prd_03_fraud_detection.md", "Fraud Detection"),
        ("prd_04_ssr_migration.md", "SSR Migration"),
        ("prd_05_notification_service.md", "Notification Service (ambiguous)"),
    ]

    passed = 0
    failed = 0

    for filename, display_name in prds:
        prd_text = load_prd(filename)
        result = test_review(prd_text, display_name)
        if validate_response(result):
            passed += 1
        else:
            failed += 1

    print(f"\n{'='*40}")
    print(f"Results: {passed} passed, {failed} failed out of {len(prds)}")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())