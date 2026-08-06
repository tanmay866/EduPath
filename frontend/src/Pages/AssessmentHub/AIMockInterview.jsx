import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card, CardHeader, CardFooterNote, Button, Toggle, MicroLabel, Loading, Empty,
  InlineMessage, type,
} from '../../design';
import { saveInterviewResult } from '../Services/interviewResultService';
import { useCareerRoles } from '../../hooks/useCareerRoles';
import { API_URL } from '../../config';

/**
 * AI mock interview — setup, then one question at a time with feedback after
 * each, then a summary.
 *
 * §7 has no entry for this screen. The question step borrows the Quiz layout
 * (header strip, 4px navy bar, Newsreader question) and both feedback panels
 * borrow the Result layout (mono figure beside a verdict, then a point list).
 */
const Page = ({ children, width = 760 }) => (
  <div style={{ background: 'var(--color-paper)', minHeight: '100vh', padding: '48px 32px' }}>
    <div style={{ maxWidth: width, margin: '0 auto' }}>{children}</div>
  </div>
);

/** Interview scores run 0–10, not 0–100, so they get their own bands. */
const scoreTone = (score) =>
  score >= 8 ? 'var(--color-green)' : score >= 5 ? 'var(--color-amber)' : 'var(--color-clay)';

const PointList = ({ label, items, tone }) => (
  <div style={{ padding: '22px 34px', borderTop: '1px solid var(--color-line)' }}>
    <MicroLabel size={10.5} tracking="0.13em" style={{ display: 'block', marginBottom: 12 }}>
      {label}
    </MicroLabel>
    {items.map((item, i) => (
      <div key={i} style={{ display: 'grid', gridTemplateColumns: '10px 1fr', gap: 14, marginTop: i ? 10 : 0, alignItems: 'start' }}>
        <span style={{ width: 8, height: 8, marginTop: 7, background: tone, display: 'block' }} />
        <span style={{ fontSize: 14.5, color: 'var(--color-text-2)', lineHeight: 1.55 }}>{item}</span>
      </div>
    ))}
  </div>
);
import {
  speakInterviewQuestion,
  speakFeedback,
  stopSpeaking as stopVoice,
  getBestVoice,
  voicesReady,
} from '../../utils/voiceService';



const VOICE_HINT_KEY = 'voiceHintSeen';

/** Joins a typed draft to recognised speech without gluing words together. */
const joinAnswer = (base, spoken) => {
  const left = (base || '').trim();
  const right = (spoken || '').trim();
  if (!left) return right;
  if (!right) return left;
  return `${left} ${right}`;
};

/**
 * What went wrong, in words that say what to do about it. The browser gives
 * these as bare codes and the old handler only logged them, so a learner who
 * had blocked the microphone saw the button flip back and nothing else.
 */
const MIC_ERRORS = {
  'not-allowed': 'Microphone access is blocked. Allow it in your browser’s site settings, or type your answer instead.',
  'service-not-allowed': 'Your browser refused speech recognition. Type your answer instead.',
  'audio-capture': 'No microphone was found. Plug one in, or type your answer instead.',
  network: 'Speech recognition needs a network connection and could not reach it. Type your answer instead.',
};

const AIMockInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Interview stages: 'setup', 'interview', 'result'
  const [stage, setStage] = useState('setup');

  // Setup state. The role defaults to the one on the profile, so the usual
  // path is to press start — but it stays changeable here for anyone who
  // wants to rehearse for a different track without editing their profile.
  //
  // Arriving from a job posting overrides it: that page has just worked out
  // which role the advert is for, and rehearsing for the profile's track
  // instead would answer a question nobody asked.
  const { roles: careerRoles } = useCareerRoles();
  const [selectedRole, setSelectedRole] = useState(
    () => location.state?.role || sessionStorage.getItem('targetRole') || ''
  );

  // Interview state
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState([]);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Which voice will actually read the questions, and whether to say so.
  //
  // Shown once per device rather than once per account: the voice list comes
  // from the browser, the choice is stored in localStorage, and the same
  // person on a laptop and a phone gets two different voices. An
  // account-level flag would tell them on one and stay quiet on the other,
  // which is the wrong way round.
  const [voiceName, setVoiceName] = useState('');
  const [showVoiceHint, setShowVoiceHint] = useState(false);

  useEffect(() => {
    let live = true;
    voicesReady().then(() => {
      if (!live) return;
      const voice = getBestVoice();
      setVoiceName(voice?.name || '');
      // Nothing to point at if the browser has no voices — Settings would
      // have nothing to offer either.
      let seen = null;
      try { seen = localStorage.getItem(VOICE_HINT_KEY); } catch { /* private mode */ }
      if (voice && !seen) setShowVoiceHint(true);
    });
    return () => { live = false; };
  }, []);

  const dismissVoiceHint = () => {
    setShowVoiceHint(false);
    try { localStorage.setItem(VOICE_HINT_KEY, '1'); } catch { /* private mode */ }
  };

  // Loading states
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Result state
  const [summary, setSummary] = useState(null);

  // Speech recognition ref
  const recognitionRef = useRef(null);
  // Whether the learner still means to be recording. The browser ends a
  // session on its own after a pause; this is what decides to resume.
  const wantRecordingRef = useRef(false);
  // What was in the field when recording started, so speech is added to a
  // typed draft rather than replacing it.
  const baseAnswerRef = useRef('');
  const finalRef = useRef('');
  const answerRef = useRef('');

  // Total questions
  const TOTAL_QUESTIONS = 5;

  // Check authentication
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
    }
  }, [navigate]);

  /**
   * Speech recognition, built once.
   *
   * This effect used to list `isRecording` as a dependency. Pressing record
   * called start() and then setIsRecording(true), which re-ran the effect —
   * whose cleanup stopped the recogniser that had just started and replaced
   * it with a fresh one. Recording ended roughly the moment it began.
   *
   * The handlers therefore cannot close over state; they read refs, which are
   * current whenever the browser calls them.
   */
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalRef.current += `${transcript} `;
        else interim += transcript;
      }
      // Interim text used to be dropped as soon as anything final existed, so
      // after the first phrase the box stopped moving while you talked. Both
      // are shown, on top of whatever was already in the field.
      setAnswer(joinAnswer(baseAnswerRef.current, finalRef.current + interim));
    };

    recognition.onerror = (event) => {
      // Silence is not a failure — continuous recognition reports it and then
      // ends, and onend restarts. Aborting is what stop() does.
      if (event.error === 'no-speech' || event.error === 'aborted') return;

      wantRecordingRef.current = false;
      setIsRecording(false);
      setMicError(MIC_ERRORS[event.error] || 'Recording stopped unexpectedly. You can type your answer instead.');
    };

    recognition.onend = () => {
      // Chrome ends the session after a pause even with continuous set, so a
      // long think mid-answer would silently end the recording. Restart while
      // the learner still means to be recording.
      if (!wantRecordingRef.current) {
        setIsRecording(false);
        return;
      }
      try {
        recognition.start();
      } catch {
        wantRecordingRef.current = false;
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      wantRecordingRef.current = false;
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      try { recognition.abort(); } catch { /* never started */ }
    };
  }, []);


  // The result handler reads this rather than closing over `answer`.
  useEffect(() => { answerRef.current = answer; }, [answer]);

  /**
   * Typing re-bases the recogniser: anything said next is added after what
   * was just typed instead of overwriting it on the following result.
   */
  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
    baseAnswerRef.current = e.target.value;
    finalRef.current = '';
  };

  // Text-to-speech
  const speak = (text, isFeedback = false) => {
    if (!voiceEnabled) return;

    const onStart = () => setIsSpeaking(true);
    const onEnd = () => setIsSpeaking(false);

    if (isFeedback) {
      speakFeedback(text, onStart, onEnd).catch(() => setIsSpeaking(false));
    } else {
      speakInterviewQuestion(text, onStart, onEnd).catch(() => setIsSpeaking(false));
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    stopVoice();
    setIsSpeaking(false);
  };

  /**
   * Begin recording, adding to the answer rather than replacing it.
   *
   * This used to clear the field first, so recording a second time — to add a
   * point you had forgotten, or after the browser cut the session short —
   * destroyed everything said so far.
   */
  const startRecording = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    setMicError('');
    // The question may still be being read aloud, and the microphone would
    // otherwise transcribe our own voice back into the answer.
    stopSpeaking();

    baseAnswerRef.current = answerRef.current;
    finalRef.current = '';
    wantRecordingRef.current = true;

    try {
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      // start() throws if a session is already running; that is the state we
      // wanted, so treat it as success rather than an error.
      if (err?.name === 'InvalidStateError') {
        setIsRecording(true);
        return;
      }
      wantRecordingRef.current = false;
      setIsRecording(false);
      setMicError('Recording could not start. You can type your answer instead.');
    }
  };

  const stopRecording = () => {
    wantRecordingRef.current = false;
    setIsRecording(false);
    try { recognitionRef.current?.stop(); } catch { /* never started */ }
  };

  // Fetch new question. Takes the question number explicitly rather than
  // reading the questionNumber state directly — nextQuestion calls
  // setQuestionNumber and this in the same tick, and state updates aren't
  // visible until the next render, so this would otherwise always send the
  // number from before the increment (every question past the first told
  // the backend it was still writing question 1, so difficulty never
  // progressed like the prompt asks it to).
  const fetchQuestion = async (qNumber = questionNumber) => {
    setLoadingQuestion(true);
    setCurrentFeedback(null);
    setAnswer('');

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/mock-interview/question`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: selectedRole,
          questionNumber: qNumber,
          previousQuestions
        })
      });

      const data = await response.json();
      if (data.success) {
        setCurrentQuestion(data.data.question);
        setPreviousQuestions(prev => [...prev, data.data.question]);

        // Speak the question
        setTimeout(() => speak(data.data.question), 500);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoadingQuestion(false);
    }
  };

  // Submit answer for evaluation
  const submitAnswer = async () => {
    if (!answer.trim()) return;

    setLoadingEvaluation(true);
    stopRecording();
    setMicError('');

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/mock-interview/evaluate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: currentQuestion,
          answer: answer.trim(),
          role: selectedRole
        })
      });

      const data = await response.json();
      if (data.success) {
        setCurrentFeedback(data.data);

        // Store result
        setResults(prev => [...prev, {
          question: currentQuestion,
          answer: answer.trim(),
          evaluation: data.data
        }]);

        // Speak feedback
        if (voiceEnabled) {
          const feedbackText = `You scored ${data.data.score} out of 10. ${data.data.feedback}`;
          setTimeout(() => speak(feedbackText, true), 500);
        }
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  // Move to next question
  const nextQuestion = () => {
    if (questionNumber >= TOTAL_QUESTIONS) {
      generateSummary();
    } else {
      const next = questionNumber + 1;
      setQuestionNumber(next);
      setCurrentFeedback(null);
      setAnswer('');
      fetchQuestion(next);
    }
  };

  // Generate final summary
  const generateSummary = async () => {
    setLoadingSummary(true);
    setStage('result');

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/mock-interview/summary`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          results,
          role: selectedRole
        })
      });

      const data = await response.json();
      if (data.success) {
        setSummary(data.data);

        // Fire-and-forget, same as the practice-test results: the summary
        // is already on screen regardless of whether this save lands.
        saveInterviewResult({
          role: selectedRole,
          overallScore: data.data.overallScore,
          recommendation: data.data.recommendation,
          summary: data.data.summary,
          topStrengths: data.data.topStrengths,
          areasToImprove: data.data.areasToImprove,
          advice: data.data.advice,
          results,
        }).catch((err) => console.error('Failed to save interview result:', err));
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Start interview
  const startInterview = () => {
    if (!selectedRole) return;
    setStage('interview');
    setQuestionNumber(1);
    setPreviousQuestions([]);
    setResults([]);
    fetchQuestion();
  };

  // Restart interview
  const restartInterview = () => {
    setStage('setup');
    // Back to the profile's role rather than blank, so starting again is one
    // press even after rehearsing for a different track.
    setSelectedRole(sessionStorage.getItem('targetRole') || '');
    setQuestionNumber(1);
    setPreviousQuestions([]);
    setResults([]);
    setCurrentQuestion('');
    setAnswer('');
    setCurrentFeedback(null);
    setSummary(null);
  };

  // Handle quit
  const handleQuit = () => {
    try { stopRecording(); } catch (e) { console.error(e) }
    try { stopSpeaking(); } catch (e) { console.error(e) }
    restartInterview();
  };

  // Setup Stage
  // ── Setup ──────────────────────────────────────────────────────────────
  if (stage === 'setup') {
    return (
      <Page width={1100}>
        <div style={{ marginBottom: 18 }}>
          <Button variant="quiet" onClick={() => navigate('/assessment-hub')}>Back to the hub</Button>
        </div>

        <Card>
          <CardHeader
            label="Mock interview"
            right={
              <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
                {`${TOTAL_QUESTIONS} QUESTIONS`}
              </MicroLabel>
            }
          />

          <div style={{ padding: '34px 34px 26px' }}>
            <h1 style={{ ...type.cardHeading, margin: 0, color: 'var(--color-ink)' }}>
              Say the answer out loud.
            </h1>
            <p style={{ ...type.body, margin: '12px 0 0', maxWidth: 560 }}>
              Five questions for your role, asked one at a time. Answer by speaking or by
              typing, and each answer is scored with what worked and what to fix before the next one.
            </p>
          </div>

          {/* The role comes from the profile, so the usual path is to press
              start. It stays changeable for rehearsing a different track,
              but changing it here does not alter the profile. */}
          <div
            style={{
              padding: '17px 34px',
              borderTop: '1px solid var(--color-line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
            }}
          >
            <div>
              <div style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--color-ink)' }}>
                Interviewing for
              </div>
              <div style={{ fontSize: 14, color: 'var(--color-text-3)', marginTop: 3 }}>
                Taken from your profile. Change it just for this interview if you like.
              </div>
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{
                padding: '11px 14px',
                fontSize: 15,
                fontFamily: 'var(--font-sans)',
                color: 'var(--color-ink)',
                background: '#fff',
                border: '1px solid var(--color-line-input)',
                borderRadius: 0,
                outline: 'none',
                // Was minWidth 240 with flexShrink 0, which forced the row
                // wider than a phone. It fills whatever the row leaves.
                flex: '1 1 200px',
                minWidth: 0,
                maxWidth: 320,
              }}
            >
              {!selectedRole && <option value="">Select a role</option>}
              {(careerRoles.length ? careerRoles : [selectedRole].filter(Boolean)).map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div
            style={{
              padding: '17px 34px',
              borderTop: '1px solid var(--color-line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--color-ink)' }}>Read questions aloud</div>
              <div style={{ fontSize: 14, color: 'var(--color-text-3)', marginTop: 3 }}>
                {voiceEnabled
                  ? 'Questions and feedback are spoken as well as shown.'
                  : 'Questions and feedback are shown only.'}
              </div>
            </div>
            <Toggle checked={voiceEnabled} onChange={setVoiceEnabled} label="Read questions aloud" />
          </div>

          {/* Names the voice rather than pointing vaguely at a setting: the
              reason it sounds the way it does is that it belongs to the
              browser, and knowing that is what makes the setting worth
              opening. Only on the setup screen, where leaving the page costs
              nothing — mid-interview it would offer to throw away progress. */}
          {showVoiceHint && voiceEnabled && (
            <div
              style={{
                padding: '14px 34px',
                borderTop: '1px solid var(--color-line)',
                background: 'var(--color-surface-attn, var(--color-surface))',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <p style={{ fontSize: 14, color: 'var(--color-text-2)', margin: 0, lineHeight: 1.55, flex: '1 1 260px' }}>
                {`Questions will be read in ${voiceName}. `}
                Voices come from your browser rather than from us, so if that one grates there are
                others — pick from them in{' '}
                <button
                  type="button"
                  onClick={() => { dismissVoiceHint(); navigate('/settings'); }}
                  style={{
                    font: 'inherit',
                    color: 'var(--color-ink)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  Settings
                </button>.
              </p>
              <Button
                variant="quiet"
                onClick={dismissVoiceHint}
                style={{ flexShrink: 0 }}
              >
                Got it
              </Button>
            </div>
          )}

          <div style={{ padding: '18px 34px', borderTop: '1px solid var(--color-line)' }}>
            <Button onClick={startInterview} disabled={!selectedRole}>Start the interview</Button>
          </div>

          <CardFooterNote>
            Speaking needs microphone access and a browser with speech recognition. Typing works
            everywhere.
          </CardFooterNote>
        </Card>
      </Page>
    );
  }

  // ── Interview ──────────────────────────────────────────────────────────
  if (stage === 'interview') {
    const progress = (questionNumber / TOTAL_QUESTIONS) * 100;
    const isLast = questionNumber >= TOTAL_QUESTIONS;

    return (
      <Page>
        <Card>
          <CardHeader
            label={`Question ${questionNumber} of ${TOTAL_QUESTIONS}`}
            right={
              <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {isSpeaking && (
                  <Button variant="quiet" onClick={stopSpeaking}>Stop reading</Button>
                )}
                <MicroLabel size={11} tracking="0.1em" color="var(--color-clay)">
                  {selectedRole}
                </MicroLabel>
              </span>
            }
          />

          <div style={{ height: 4, background: 'var(--color-bar-empty)' }}>
            <div style={{ height: 4, width: `${progress}%`, background: 'var(--color-navy)' }} />
          </div>

          <div style={{ padding: '32px 34px 34px' }}>
            {loadingQuestion ? (
              <Loading label="Writing the question" />
            ) : (
              <h1 style={{ ...type.question, margin: 0, color: 'var(--color-ink)' }}>{currentQuestion}</h1>
            )}

            {!currentFeedback && !loadingQuestion && (
              <>
                <div style={{ marginTop: 26 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <MicroLabel size={11} tracking="0.12em">Your answer</MicroLabel>
                    <MicroLabel size={10.5} color={isRecording ? 'var(--color-clay)' : 'var(--color-text-4)'}>
                      {isRecording ? 'LISTENING' : `${answer.trim().split(/\s+/).filter(Boolean).length} WORDS`}
                    </MicroLabel>
                  </div>

                  <textarea
                    value={answer}
                    onChange={handleAnswerChange}
                    rows={7}
                    placeholder="Speak, or type your answer here"
                    style={{
                      width: '100%',
                      padding: '13px 14px',
                      fontSize: 15,
                      fontFamily: 'var(--font-sans)',
                      lineHeight: 1.55,
                      color: 'var(--color-ink)',
                      background: '#fff',
                      border: `1px solid ${isRecording ? 'var(--color-clay)' : 'var(--color-line-input)'}`,
                      borderRadius: 0,
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* The browser reports these as bare codes and they were only
                    reaching the console, so a blocked microphone looked like a
                    button that did nothing. */}
                {(micError || !speechSupported) && (
                  <InlineMessage tone="error" style={{ marginTop: 14 }}>
                    {micError || 'This browser cannot record speech. Chrome or Edge can, and typing works everywhere.'}
                  </InlineMessage>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <Button
                      variant={isRecording ? 'attention' : 'secondary'}
                      style={{ padding: '10px 20px', fontSize: 14 }}
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={!speechSupported}
                      title={speechSupported ? undefined : 'This browser has no speech recognition'}
                    >
                      {isRecording ? 'Stop recording' : 'Record answer'}
                    </Button>
                    <Button variant="quiet" onClick={handleQuit}>Leave the interview</Button>
                  </div>

                  <Button
                    onClick={submitAnswer}
                    loading={loadingEvaluation}
                    loadingLabel="Scoring…"
                    disabled={!answer.trim()}
                  >
                    Submit answer
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>

        {currentFeedback && (
          <Card style={{ marginTop: 22 }}>
            <CardHeader label="Feedback" />

            <div style={{ padding: 34, display: 'flex', gap: 40, alignItems: 'flex-start' }}>
              <div>
                <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 10 }}>
                  Score
                </MicroLabel>
                <span style={{ ...type.heroMetric, color: scoreTone(currentFeedback.score), display: 'block', lineHeight: 1 }}>
                  {currentFeedback.score}
                  <span style={{ fontSize: 20, color: 'var(--color-text-4)' }}>/10</span>
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6, margin: 0 }}>
                  {currentFeedback.feedback}
                </p>
              </div>
            </div>

            {currentFeedback.strengths?.length > 0 && (
              <PointList label="What worked" items={currentFeedback.strengths} tone="var(--color-green)" />
            )}
            {currentFeedback.improvements?.length > 0 && (
              <PointList label="What to fix" items={currentFeedback.improvements} tone="var(--color-clay)" />
            )}

            <div style={{ padding: '18px 34px', borderTop: '1px solid var(--color-line)', display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={nextQuestion}>
                {isLast ? 'Finish and see the summary' : 'Next question'}
              </Button>
            </div>
          </Card>
        )}
      </Page>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────
  if (stage === 'result') {
    if (loadingSummary) {
      return <Page><Card><Loading label="Writing your summary" /></Card></Page>;
    }

    if (!summary) {
      return (
        <Page>
          <Card>
            <Empty action={<Button onClick={restartInterview}>Start over</Button>}>
              The summary could not be generated. Your answers were still scored one by one.
            </Empty>
          </Card>
        </Page>
      );
    }

    return (
      <Page>
        <Card>
          <CardHeader
            label={selectedRole || 'Mock interview'}
            right={
              <MicroLabel size={11} tracking="0.1em" color={scoreTone(summary.overallScore)}>
                {String(summary.recommendation || '').replace(/_/g, ' ')}
              </MicroLabel>
            }
          />

          <div style={{ padding: 34, display: 'flex', gap: 40, alignItems: 'flex-start' }}>
            <div>
              <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 10 }}>
                Overall
              </MicroLabel>
              <span style={{ ...type.heroMetric, fontSize: 68, color: scoreTone(summary.overallScore), display: 'block', lineHeight: 1 }}>
                {summary.overallScore}
              </span>
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6, margin: 0 }}>
                {summary.summary}
              </p>
            </div>
          </div>

          {summary.topStrengths?.length > 0 && (
            <PointList label="Strengths" items={summary.topStrengths} tone="var(--color-green)" />
          )}
          {summary.areasToImprove?.length > 0 && (
            <PointList label="Work on" items={summary.areasToImprove} tone="var(--color-clay)" />
          )}

          {summary.advice && (
            <div style={{ padding: '22px 34px', borderTop: '1px solid var(--color-line)' }}>
              <MicroLabel size={10.5} tracking="0.13em" style={{ display: 'block', marginBottom: 10 }}>
                Before the next one
              </MicroLabel>
              <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6, margin: 0 }}>
                {summary.advice}
              </p>
            </div>
          )}

          <div
            style={{
              padding: '18px 34px',
              borderTop: '1px solid var(--color-line)',
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
            }}
          >
            <Button variant="secondary" onClick={() => navigate('/assessment-hub')}>Back to the hub</Button>
            <Button onClick={restartInterview}>Interview again</Button>
          </div>

          <CardFooterNote>This interview is saved — find it again from the hub.</CardFooterNote>
        </Card>
      </Page>
    );
  }

  return <Page><Card><Loading /></Card></Page>;
};

export default AIMockInterview;
