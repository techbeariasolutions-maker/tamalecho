import { useEffect, useRef, useState } from 'react';
import Button from '../../components/Button.jsx';
import { isCorrectChoice } from '../../services/quiz.js';

// Microevaluación voluntaria (HU-10.1-A). Es opcional: la lectura y el resto de la ficha no
// dependen de ella (HU-10.1-B). Mientras `question.approved` sea false se rotula como borrador.
// Props:
// - question: { id, question, options, correctIndex, feedback, approved }
// - saved: respuesta ya guardada en el dispositivo ({ correct, at }) o undefined
// - onAnswer(correct): guarda el resultado
export default function TipQuiz({ question, saved, onAnswer }) {
  const [choice, setChoice] = useState(null);
  // Resultado mostrado: el del intento actual o, al volver a la ficha, el que ya estaba guardado.
  const [attempt, setAttempt] = useState(() => (saved ? { correct: saved.correct } : null));
  const [retried, setRetried] = useState(false);
  const fieldsetRef = useRef(null);
  const headingId = `quiz-titulo-${question.id}`;

  // «Intentar otra vez» desaparece al pulsarse: el foco pasa a la primera opción para no perderse.
  useEffect(() => {
    if (retried && !attempt) fieldsetRef.current?.querySelector('input')?.focus();
  }, [retried, attempt]);

  const check = () => {
    const correct = isCorrectChoice(question, choice);
    setAttempt({ correct });
    onAnswer(correct);
  };

  const retry = () => {
    setChoice(null);
    setAttempt(null);
    setRetried(true);
  };

  return (
    <section className="quiz" aria-labelledby={headingId}>
      <h2 id={headingId}>Pon a prueba lo que leíste</h2>
      <p>Es opcional: puedes seguir sin responder y tu lectura cuenta igual.</p>
      {!question.approved && (
        <p className="quiz__draft">Borrador: esta pregunta está pendiente de aprobación del Product Owner.</p>
      )}

      <fieldset className="quiz__fieldset" ref={fieldsetRef} disabled={Boolean(attempt)}>
        <legend className="quiz__legend">{question.question}</legend>
        {question.options.map((option, index) => (
          <label key={option} className="quiz__option">
            <input
              type="radio"
              name={`quiz-${question.id}`}
              value={index}
              checked={choice === index}
              onChange={() => setChoice(index)}
            />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>

      {!attempt && (
        <Button onClick={check} disabled={choice === null}>
          Comprobar respuesta
        </Button>
      )}

      {/* Región anunciable: aria-live (no role="status", que ya usa la página para otro aviso). */}
      <div className="quiz__feedback" aria-live="polite">
        {attempt && (
          <>
            <p className="quiz__result">
              {attempt.correct ? 'Respuesta correcta.' : 'Todavía no es la respuesta correcta.'}
            </p>
            <p>{question.feedback}</p>
            <Button variant="secondary" onClick={retry}>
              Intentar otra vez
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
