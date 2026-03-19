"""
Skill Assessment Service - AI-powered skill analysis
Unified async service for analyzing quiz results and providing intelligent recommendations
"""
import asyncio
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_huggingface import HuggingFaceEndpoint

from config import settings, RECOMMENDATION_TEMPLATES, CAREER_SKILL_MAPPING
from models.agent_models import AgentAssessment
from models.schemas import AIAnalysis


class SkillAssessmentService:
    """
    AI Service for comprehensive skill assessment analysis
    Combines LLM-powered recommendations with rule-based analysis
    """

    def __init__(self):
        """Initialize the Skill Assessment Service with LLM"""
        self.settings = settings
        self.llm = None
        self._initialize_llm()

    def _initialize_llm(self):
        """Initialize HuggingFace LLM"""
        try:
            self.llm = HuggingFaceEndpoint(
                repo_id=self.settings.LLM_MODEL,
                huggingfacehub_api_token=self.settings.HUGGINGFACE_API_KEY,
                task="text2text-generation",
                model_kwargs={
                    "temperature": self.settings.LLM_TEMPERATURE,
                    "max_length": 512,
                    "top_p": 0.9
                }
            )
            print(f"✅ LLM initialized: {self.settings.LLM_MODEL}")
        except Exception as e:
            print(f"⚠️  LLM initialization failed: {e}")
            print("🔄 Continuing with rule-based analysis...")
            self.llm = None

    async def assess_skill(
        self,
        skill_name: str,
        normalized_score: float,
        accuracy: float,
        difficulty_breakdown: Dict,
        answers: List[Dict],
        career_path: str,
        user_level: str = "Intermediate",
        user_id: Optional[str] = None
    ) -> AIAnalysis:
        """
        Perform comprehensive skill assessment analysis

        Args:
            skill_name: Name of the skill being assessed
            normalized_score: Score normalized to 0-100 scale
            accuracy: Overall accuracy percentage
            difficulty_breakdown: Performance breakdown by difficulty level
            answers: List of quiz answers with details
            career_path: Target career path (MERN, AI, Cyber, etc.)
            user_level: User's current experience level
            user_id: Optional user ID for database storage

        Returns:
            AIAnalysis object with comprehensive assessment results
        """
        # Run analysis in executor to avoid blocking
        loop = asyncio.get_event_loop()
        analysis_result = await loop.run_in_executor(
            None,
            self._analyze_performance,
            skill_name,
            normalized_score,
            accuracy,
            difficulty_breakdown,
            answers,
            career_path,
            user_level
        )

        # Build response
        ai_analysis = self._build_analysis_response(
            analysis_result,
            difficulty_breakdown,
            accuracy
        )

        # Save to database if user_id provided
        if user_id:
            try:
                await self._save_assessment(
                    user_id=user_id,
                    skill_name=skill_name,
                    career_path=career_path,
                    user_level=user_level,
                    normalized_score=normalized_score,
                    accuracy=accuracy,
                    difficulty_breakdown=difficulty_breakdown,
                    ai_analysis=ai_analysis
                )
            except Exception as e:
                print(f"⚠️  Failed to save assessment to database: {e}")

        return ai_analysis

    def _analyze_performance(
        self,
        skill_name: str,
        normalized_score: float,
        accuracy: float,
        difficulty_breakdown: Dict,
        answers: List[Dict],
        career_path: str,
        user_level: str
    ) -> Dict:
        """Core analysis logic (runs synchronously in executor)"""

        # Calculate skill strength score
        skill_strength = self._calculate_skill_strength(
            normalized_score,
            accuracy,
            difficulty_breakdown
        )

        # Identify weak areas
        weak_areas = self._identify_weak_areas(
            difficulty_breakdown,
            answers,
            skill_name
        )

        # Determine performance category
        performance_category = self._categorize_performance(
            skill_strength,
            difficulty_breakdown
        )

        # Generate recommendations
        if self.llm:
            recommendations = self._generate_llm_recommendations(
                skill_name,
                performance_category,
                weak_areas,
                career_path
            )
        else:
            recommendations = self._generate_rule_based_recommendations(
                performance_category,
                weak_areas,
                skill_name
            )

        # Suggest next steps
        next_steps = self._suggest_next_steps(
            skill_strength,
            weak_areas,
            career_path,
            skill_name
        )

        # Calculate performance insights
        performance_insights = self._calculate_performance_insights(
            difficulty_breakdown,
            answers
        )

        return {
            "skillStrength": round(skill_strength, 2),
            "weakAreas": weak_areas,
            "recommendations": recommendations,
            "nextSteps": next_steps,
            "performanceInsights": performance_insights
        }

    def _calculate_skill_strength(
        self,
        normalized_score: float,
        accuracy: float,
        difficulty_breakdown: Dict
    ) -> float:
        """Calculate weighted skill strength score"""
        # Base score from normalized score
        base_score = normalized_score * self.settings.ACCURACY_WEIGHT

        # Difficulty bonus/penalty
        beginner_acc = difficulty_breakdown['beginner']['accuracy']
        intermediate_acc = difficulty_breakdown['intermediate']['accuracy']
        advanced_acc = difficulty_breakdown['advanced']['accuracy']

        # Weighted difficulty score
        difficulty_score = (
            beginner_acc * 0.2 +
            intermediate_acc * 0.3 +
            advanced_acc * 0.5
        ) * self.settings.DIFFICULTY_WEIGHT * 100

        # Combine scores
        skill_strength = base_score + difficulty_score

        # Apply penalty for unbalanced performance
        if beginner_acc < 50 or (advanced_acc > 80 and beginner_acc < 80):
            skill_strength *= 0.9  # 10% penalty for weak fundamentals

        return min(100, max(0, skill_strength))

    def _identify_weak_areas(
        self,
        difficulty_breakdown: Dict,
        answers: List[Dict],
        skill_name: str
    ) -> List[str]:
        """Identify areas where the user needs improvement"""
        weak_areas = []

        # Check difficulty-based weak areas
        for difficulty, stats in difficulty_breakdown.items():
            if stats['attempted'] > 0 and stats['accuracy'] < 50:
                weak_areas.append(f"{difficulty.capitalize()} level {skill_name} concepts")

        # Analyze incorrect answers
        incorrect_answers = [a for a in answers if not a['isCorrect']]

        if len(incorrect_answers) > 0:
            difficulty_errors = {}
            for ans in incorrect_answers:
                diff = ans['difficulty']
                difficulty_errors[diff] = difficulty_errors.get(diff, 0) + 1

            # Find predominant error pattern
            if difficulty_errors:
                max_errors = max(difficulty_errors.values())
                for diff, count in difficulty_errors.items():
                    if count == max_errors and count >= 3:
                        weak_areas.append(f"Conceptual understanding in {diff.lower()} topics")

        # Add specific weak areas based on skill
        if difficulty_breakdown['beginner']['accuracy'] < 60:
            weak_areas.append(f"Fundamental {skill_name} principles")

        if difficulty_breakdown['advanced']['accuracy'] < 40:
            weak_areas.append(f"Advanced {skill_name} applications and patterns")

        return list(set(weak_areas))[:5]

    def _categorize_performance(
        self,
        skill_strength: float,
        difficulty_breakdown: Dict
    ) -> str:
        """Categorize overall performance level"""
        advanced_acc = difficulty_breakdown['advanced']['accuracy']
        intermediate_acc = difficulty_breakdown['intermediate']['accuracy']

        if skill_strength >= self.settings.ADVANCED_THRESHOLD and advanced_acc >= 60:
            return "strong_advanced"
        elif skill_strength >= self.settings.ADVANCED_THRESHOLD:
            return "weak_advanced"
        elif skill_strength >= self.settings.INTERMEDIATE_THRESHOLD and intermediate_acc >= 60:
            return "strong_intermediate"
        elif skill_strength >= self.settings.INTERMEDIATE_THRESHOLD:
            return "weak_intermediate"
        elif skill_strength >= self.settings.BEGINNER_THRESHOLD:
            return "strong_beginner"
        else:
            return "weak_beginner"

    def _generate_llm_recommendations(
        self,
        skill_name: str,
        performance_category: str,
        weak_areas: List[str],
        career_path: str
    ) -> List[str]:
        """Generate recommendations using LLM"""
        try:
            prompt_template = PromptTemplate(
                input_variables=["skill", "performance", "weak_areas", "career"],
                template="""You are an expert learning advisor for {career} developers.

Skill: {skill}
Performance Level: {performance}
Weak Areas: {weak_areas}

Provide 4 specific, actionable learning recommendations to improve this skill.
Keep each recommendation concise (1-2 sentences).

Recommendations:"""
            )

            chain = LLMChain(llm=self.llm, prompt=prompt_template)

            response = chain.run(
                skill=skill_name,
                performance=performance_category.replace("_", " "),
                weak_areas=", ".join(weak_areas) if weak_areas else "None identified",
                career=career_path
            )

            # Parse response into list
            recommendations = [
                rec.strip()
                for rec in response.split('\n')
                if rec.strip() and not rec.strip().startswith('Recommendations:')
            ]

            return recommendations[:4] if recommendations else self._generate_rule_based_recommendations(
                performance_category, weak_areas, skill_name
            )

        except Exception as e:
            print(f"LLM recommendation generation failed: {e}")
            return self._generate_rule_based_recommendations(
                performance_category, weak_areas, skill_name
            )

    def _generate_rule_based_recommendations(
        self,
        performance_category: str,
        weak_areas: List[str],
        skill_name: str
    ) -> List[str]:
        """Generate recommendations using rule-based templates"""
        base_recommendations = RECOMMENDATION_TEMPLATES.get(
            performance_category,
            RECOMMENDATION_TEMPLATES["weak_intermediate"]
        )

        recommendations = base_recommendations.copy()

        if weak_areas:
            recommendations.append(
                f"Focus specifically on: {', '.join(weak_areas[:2])}"
            )

        recommendations.append(
            f"Complete hands-on projects using {skill_name} to reinforce learning"
        )

        return recommendations[:4]

    def _suggest_next_steps(
        self,
        skill_strength: float,
        weak_areas: List[str],
        career_path: str,
        skill_name: str
    ) -> List[str]:
        """Suggest concrete next steps based on analysis"""
        next_steps = []

        # Based on skill strength
        if skill_strength < 50:
            next_steps.append(f"Complete beginner-level {skill_name} tutorials")
            next_steps.append("Practice 30 minutes daily with simple exercises")
        elif skill_strength < 70:
            next_steps.append(f"Build 2-3 intermediate {skill_name} projects")
            next_steps.append("Study best practices and design patterns")
        else:
            next_steps.append(f"Contribute to open-source {skill_name} projects")
            next_steps.append("Mentor others and solidify your knowledge")

        # Based on weak areas
        if weak_areas:
            next_steps.append(f"Review and strengthen: {weak_areas[0]}")

        # Career-specific suggestions
        if career_path in CAREER_SKILL_MAPPING:
            related_skills = CAREER_SKILL_MAPPING[career_path]
            if skill_name in related_skills:
                next_steps.append(
                    f"Prepare for {career_path} role by mastering complementary skills"
                )

        return next_steps[:4]

    def _calculate_performance_insights(
        self,
        difficulty_breakdown: Dict,
        answers: List[Dict]
    ) -> Dict[str, float]:
        """Calculate detailed performance metrics"""
        total_questions = sum(d['attempted'] for d in difficulty_breakdown.values())

        insights = {
            "totalQuestions": float(total_questions),
            "beginnerAccuracy": difficulty_breakdown['beginner']['accuracy'],
            "intermediateAccuracy": difficulty_breakdown['intermediate']['accuracy'],
            "advancedAccuracy": difficulty_breakdown['advanced']['accuracy'],
            "consistencyScore": self._calculate_consistency(difficulty_breakdown),
            "progressionReadiness": self._calculate_progression_readiness(difficulty_breakdown)
        }

        return insights

    def _calculate_consistency(self, difficulty_breakdown: Dict) -> float:
        """Calculate consistency across difficulty levels"""
        accuracies = [
            difficulty_breakdown['beginner']['accuracy'],
            difficulty_breakdown['intermediate']['accuracy'],
            difficulty_breakdown['advanced']['accuracy']
        ]

        # Filter out zero values
        accuracies = [a for a in accuracies if a > 0]

        if len(accuracies) < 2:
            return 0.0

        # Lower standard deviation = higher consistency
        std_dev = np.std(accuracies)
        consistency = max(0, 100 - std_dev)

        return round(consistency, 2)

    def _calculate_progression_readiness(self, difficulty_breakdown: Dict) -> float:
        """Calculate readiness to progress to next level"""
        beginner_acc = difficulty_breakdown['beginner']['accuracy']
        intermediate_acc = difficulty_breakdown['intermediate']['accuracy']
        advanced_acc = difficulty_breakdown['advanced']['accuracy']

        if advanced_acc >= 70:
            readiness = 100.0
        elif intermediate_acc >= 70 and advanced_acc >= 40:
            readiness = 80.0
        elif beginner_acc >= 70 and intermediate_acc >= 40:
            readiness = 60.0
        elif beginner_acc >= 60:
            readiness = 40.0
        else:
            readiness = 20.0

        return readiness

    def _build_analysis_response(
        self,
        analysis_result: Dict,
        difficulty_breakdown: Dict,
        accuracy: float
    ) -> AIAnalysis:
        """Build AIAnalysis response object"""
        performance_insights = analysis_result.get("performanceInsights", {})

        # Build weak areas with severity
        weak_areas_list = []
        for weak_area in analysis_result.get("weakAreas", []):
            weak_areas_list.append({
                "area": weak_area,
                "severity": self._determine_severity(weak_area, difficulty_breakdown),
                "recommendation": f"Focus on improving {weak_area.lower()}"
            })

        # Create AI Analysis response
        return AIAnalysis(
            skill_strength=analysis_result.get("skillStrength", 0.0),
            weak_areas=weak_areas_list,
            strengths=self._identify_strengths(difficulty_breakdown, accuracy),
            recommendations=analysis_result.get("recommendations", []),
            next_steps=analysis_result.get("nextSteps", []),
            consistency_score=performance_insights.get("consistencyScore", 0.0),
            progression_readiness=self._format_progression_readiness(
                performance_insights.get("progressionReadiness", 0.0)
            ),
            estimated_time_to_next_level=self._estimate_time_to_next_level(
                analysis_result.get("skillStrength", 0.0),
                performance_insights.get("progressionReadiness", 0.0)
            )
        )

    def _determine_severity(self, weak_area: str, difficulty_breakdown: Dict) -> str:
        """Determine severity level of a weak area"""
        if "beginner" in weak_area.lower() or "fundamental" in weak_area.lower():
            return "High"
        elif "intermediate" in weak_area.lower():
            return "Medium"
        else:
            return "Low"

    def _identify_strengths(self, difficulty_breakdown: Dict, accuracy: float) -> List[str]:
        """Identify user's strengths based on performance"""
        strengths = []

        if difficulty_breakdown['beginner']['accuracy'] >= 80:
            strengths.append("Strong foundation in fundamentals")

        if difficulty_breakdown['intermediate']['accuracy'] >= 70:
            strengths.append("Good grasp of intermediate concepts")

        if difficulty_breakdown['advanced']['accuracy'] >= 60:
            strengths.append("Capable of handling advanced challenges")

        if accuracy >= 85:
            strengths.append("Excellent overall accuracy")

        # Ensure at least one strength
        if not strengths and accuracy >= 50:
            strengths.append("Making steady progress")
        elif not strengths:
            strengths.append("Ready to improve with focused practice")

        return strengths

    def _format_progression_readiness(self, readiness_score: float) -> str:
        """Format progression readiness as descriptive text"""
        if readiness_score >= 80:
            return "Ready for advanced topics"
        elif readiness_score >= 60:
            return "Ready to progress to next level"
        elif readiness_score >= 40:
            return "Continue building fundamentals"
        else:
            return "Focus on current level mastery"

    def _estimate_time_to_next_level(
        self,
        skill_strength: float,
        progression_readiness: float
    ) -> str:
        """Estimate time needed to reach next level"""
        if skill_strength >= 85:
            return "Expert level - focus on mastery"
        elif skill_strength >= 70 and progression_readiness >= 60:
            return "2-4 weeks with consistent practice"
        elif skill_strength >= 50:
            return "1-2 months with regular practice"
        else:
            return "2-3 months of dedicated learning"

    async def _save_assessment(
        self,
        user_id: str,
        skill_name: str,
        career_path: str,
        user_level: str,
        normalized_score: float,
        accuracy: float,
        difficulty_breakdown: Dict,
        ai_analysis: AIAnalysis
    ):
        """Save assessment results to MongoDB"""
        assessment = AgentAssessment(
            user_id=user_id,
            skill_name=skill_name,
            career_path=career_path,
            user_level=user_level,
            normalized_score=normalized_score,
            accuracy=accuracy,
            skill_strength=ai_analysis.skill_strength,
            performance_category=ai_analysis.progression_readiness or "Unknown",
            difficulty_breakdown=difficulty_breakdown,
            weak_areas=ai_analysis.weak_areas,
            strengths=ai_analysis.strengths,
            recommendations=ai_analysis.recommendations,
            next_steps=ai_analysis.next_steps,
            consistency_score=ai_analysis.consistency_score,
            progression_readiness=ai_analysis.progression_readiness,
            estimated_time_to_next_level=ai_analysis.estimated_time_to_next_level,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        await assessment.insert()
        print(f"✅ Assessment saved to database for user: {user_id}")


# Singleton instance
skill_assessment_service = SkillAssessmentService()
