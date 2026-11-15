// Microevaluación (HU-10). Funciones puras: no leen el almacenamiento ni el catálogo directamente.
// Las preguntas son voluntarias y nunca bloquean la lectura (HU-10.1-B).

// ¿La opción elegida es la correcta? Cualquier índice fuera de rango cuenta como incorrecto.
export function isCorrectChoice(question, choice) {
  return Number.isInteger(choice) && choice === question.correctIndex;
}

// Resumen por enfoque para el panel de Mi progreso (HU-10.2-A).
// - questions: lista de preguntas { tipId, ... }
// - answers: { [tipId]: { correct, at } } guardado en el dispositivo
// - tips: lista del catálogo, para saber el enfoque de cada pregunta
// Solo cuenta respuestas de preguntas que existen: si una pregunta se retira, su respuesta se ignora.
export function summarizeQuiz({ questions, answers, tips }) {
  const frameworkOf = new Map(tips.map((tip) => [tip.id, tip.framework]));
  const byFramework = {};
  for (const framework of new Set(tips.map((tip) => tip.framework))) {
    byFramework[framework] = { available: 0, answered: 0, correct: 0 };
  }
  for (const question of questions) {
    const framework = frameworkOf.get(question.tipId);
    if (!framework) continue;
    const entry = byFramework[framework];
    entry.available += 1;
    const answer = answers[question.tipId];
    if (answer) {
      entry.answered += 1;
      if (answer.correct) entry.correct += 1;
    }
  }
  return byFramework;
}
