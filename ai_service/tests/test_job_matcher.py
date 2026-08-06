"""
Reading a job posting against the curriculum.

The failure this guards against is a confident wrong answer. Telling someone
their DevOps posting is a Mobile track, or that they are 40 weeks from a job
they could apply for now, is worse than saying nothing — so the vague-posting
case matters as much as the matching ones.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from utils.job_matcher import (  # noqa: E402
    analyse_job, match_role, skill_aliases, _derive_aliases, _mentions,
)

MERN_AD = """Full Stack Developer. React front end, Node/Express services, MongoDB.
Strong JavaScript including ES6+ and async patterns. Redux. REST APIs.
JWT authentication. Deploy to Vercel."""

DEVOPS_AD = """Site Reliability Engineer. Kubernetes clusters and CI/CD pipelines.
Terraform for infrastructure. AWS. Docker. Linux and bash. Prometheus. Git."""

VAGUE_AD = """We're hiring a motivated team player with excellent communication
skills for our fast-paced startup. Ownership mentality essential."""


class TestAliases:
    def test_parentheticals_become_aliases(self):
        # "Cloud Fundamentals (AWS/Azure/GCP)" names the three things a posting
        # will actually write; the phrase "cloud fundamentals" is not one.
        aliases = _derive_aliases("Cloud Fundamentals (AWS/Azure/GCP)")
        assert "aws" in aliases and "azure" in aliases and "gcp" in aliases

    def test_filler_words_are_not_aliases(self):
        # "Basics" appears in nine skill names. A posting containing the word
        # would otherwise match all nine.
        for skill in ("Python Basics", "React Basics", "NLP Basics"):
            assert "basics" not in _derive_aliases(skill)

    def test_every_curriculum_skill_has_at_least_one_alias(self):
        empty = [s for s, a in skill_aliases().items() if not a]
        assert empty == [], f"skills with no way to be matched: {empty}"


class TestMentions:
    def test_matches_on_a_whole_token(self):
        assert _mentions("we use react daily", "react")
        assert _mentions("experience with node.js", "node.js")

    def test_does_not_match_inside_a_longer_word(self):
        # The trap the old fuzzy matcher fell into at a 0.7 threshold: "react"
        # scoring against "REST API Design", and short aliases firing on any
        # word that contains them.
        assert not _mentions("we are reactive to feedback", "react")
        assert not _mentions("going forward", "go")
        assert not _mentions("restaurant tech", "rest")

    def test_punctuation_in_an_alias_is_literal(self):
        assert _mentions("ci/cd experience", "ci/cd")
        assert not _mentions("cixcd experience", "ci/cd")


class TestRoleMatching:
    def test_picks_the_right_track(self):
        assert match_role(MERN_AD)[0]["role"] == "MERN Developer"
        assert match_role(DEVOPS_AD)[0]["role"] == "DevOps Engineer"

    def test_only_canonical_roles_are_reported(self):
        # ROLE_TEMPLATES also holds twelve alternate spellings. An earlier
        # version returned "Web Development" instead of "MERN Developer",
        # which is not a role the rest of the system recognises.
        allowed = {
            "MERN Developer", "AI/ML Engineer", "Data Science Engineer",
            "DevOps Engineer", "Mobile Developer", "Cybersecurity Engineer",
        }
        assert {r["role"] for r in match_role(MERN_AD)} == allowed

    def test_scored_by_share_not_count(self):
        # MERN has 14 skills to Cybersecurity's 7. Scoring on the raw number
        # matched would hand MERN almost any posting.
        security = """OWASP Top 10, penetration testing, incident response with
        Splunk SIEM. Networking, TCP/IP. Linux. Cryptography."""
        assert match_role(security)[0]["role"] == "Cybersecurity Engineer"

    def test_a_posting_about_nothing_technical_matches_nothing(self):
        assert match_role(VAGUE_AD)[0]["coverage"] == 0.0


class TestAnalysis:
    def test_reports_what_is_missing_and_how_long(self):
        r = analyse_job(MERN_AD, known_skills=[], hours_per_week=10)
        assert r["matched_role"] == "MERN Developer"
        assert r["missing"] == r["required"]
        assert r["weeks_to_ready"] > 0

    def test_what_the_learner_already_has_is_not_scheduled(self):
        known = ["JavaScript Basics", "React Basics", "Node.js Basics"]
        without = analyse_job(MERN_AD, known_skills=[], hours_per_week=10)
        with_known = analyse_job(MERN_AD, known_skills=known, hours_per_week=10)

        assert set(with_known["already_have"]) == set(known) & set(with_known["required"])
        assert len(with_known["missing"]) < len(without["missing"])
        assert with_known["weeks_to_ready"] < without["weeks_to_ready"]

    def test_known_skills_are_matched_case_insensitively(self):
        r = analyse_job(MERN_AD, known_skills=["react basics", "EXPRESS.JS"])
        assert "React Basics" in r["already_have"]
        assert "Express.js" in r["already_have"]

    def test_a_vague_posting_returns_nothing_rather_than_a_guess(self):
        r = analyse_job(VAGUE_AD)
        assert r["matched_role"] is None
        assert r["weeks_to_ready"] == 0
        assert r["required"] == []

    def test_hours_scale_with_availability(self):
        slow = analyse_job(MERN_AD, hours_per_week=5)
        fast = analyse_job(MERN_AD, hours_per_week=20)
        assert slow["hours_to_ready"] == fast["hours_to_ready"]
        assert slow["weeks_to_ready"] > fast["weeks_to_ready"]

    def test_weeks_round_up(self):
        # A plan needing 10.5 weeks takes eleven. Rounding down would promise
        # a date that cannot be met.
        r = analyse_job(MERN_AD, hours_per_week=10)
        assert r["weeks_to_ready"] >= r["hours_to_ready"] / 10

    def test_zero_hours_per_week_does_not_divide_by_zero(self):
        r = analyse_job(MERN_AD, hours_per_week=0)
        assert r["weeks_to_ready"] > 0

    def test_a_role_hint_overrides_the_best_match(self):
        # Plenty of postings genuinely span two tracks. Someone on the DevOps
        # track reading this one should be able to ask what it means for the
        # track they are actually on, rather than being told it is MERN.
        spanning = """Full Stack Engineer. React and Node/Express with MongoDB.
        You will also own the Docker setup, the CI/CD pipelines and our
        Kubernetes deployment on AWS."""

        assert analyse_job(spanning)["matched_role"] == "DevOps Engineer"
        hinted = analyse_job(spanning, role_hint="MERN Developer")
        assert hinted["matched_role"] == "MERN Developer"
        assert "Express.js" in hinted["required"]

    def test_a_hint_for_a_track_the_posting_does_not_touch_says_so(self):
        # Rather than reporting the role with an empty requirement list, which
        # would read as "you are ready for this job".
        r = analyse_job(MERN_AD, role_hint="Cybersecurity Engineer")
        assert r["matched_role"] is None
        assert r["required"] == []

    def test_empty_input_is_handled(self):
        for text in ("", None, "   "):
            r = analyse_job(text)
            assert r["matched_role"] is None
