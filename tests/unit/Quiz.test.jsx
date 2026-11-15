import { beforeEach, describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp.jsx';
import { getBrowserRepository } from '../../src/services/storage.js';
import { getQuestionForTip, getQuestions, getTipById, getTips } from '../../src/services/catalog.js';
import { isCorrectChoice, summarizeQuiz } from '../../src/services/quiz.js';

// Microevaluación (HU-10). Las preguntas son datos en borrador: nunca bloquean la lectura.

describe('datos de las preguntas', () => {
  it('cada pregunta apunta a un consejo real, tiene opciones válidas y sigue en borrador', () => {
    const questions = getQuestions();
    expect(questions.length).toBeGreaterThan(0);
    const ids = questions.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
    const tipIds = questions.map((question) => question.tipId);
    expect(new Set(tipIds).size).toBe(tipIds.length); // una pregunta por consejo
    for (const question of questions) {
      expect(getTipById(question.tipId)).not.toBeNull();
      expect(question.options.length).toBeGreaterThanOrEqual(2);
      expect(new Set(question.options).size).toBe(question.options.length);
      expect(Number.isInteger(question.correctIndex)).toBe(true);
      expect(question.options[question.correctIndex]).toBeTruthy();
      expect(question.feedback.length).toBeGreaterThan(0);
      // Hasta que el PO las valide (HU-10.1-B), ninguna debe estar aprobada.
      expect(question.approved).toBe(false);
    }
  });

  it('hay preguntas de ambos enfoques', () => {
    const frameworks = new Set(getQuestions().map((question) => getTipById(question.tipId).framework));
    expect(frameworks).toEqual(new Set(['scrum', 'pmbok']));
  });

  it('getQuestionForTip devuelve null si el consejo no tiene pregunta', () => {
    expect(getQuestionForTip('SCR-01')?.tipId).toBe('SCR-01');
    expect(getQuestionForTip('SCR-12')).toBeNull();
    expect(getQuestionForTip('XXX')).toBeNull();
  });
});

describe('servicio quiz', () => {
  it('isCorrectChoice solo acepta el índice correcto', () => {
    const question = { correctIndex: 1 };
    expect(isCorrectChoice(question, 1)).toBe(true);
    expect(isCorrectChoice(question, 0)).toBe(false);
    expect(isCorrectChoice(question, null)).toBe(false);
    expect(isCorrectChoice(question, '1')).toBe(false);
  });

  it('summarizeQuiz cuenta por enfoque y no cuenta respuestas de preguntas retiradas', () => {
    const tips = getTips();
    const questions = [{ tipId: 'SCR-01' }, { tipId: 'SCR-02' }, { tipId: 'PMI-01' }];
    const answers = {
      'SCR-01': { correct: true, at: 'x' },
      'SCR-02': { correct: false, at: 'x' },
      'SCR-09': { correct: true, at: 'x' }, // sin pregunta: se ignora
    };
    expect(summarizeQuiz({ questions, answers, tips })).toEqual({
      scrum: { available: 2, answered: 2, correct: 1 },
      pmbok: { available: 1, answered: 0, correct: 0 },
    });
  });
});

describe('pregunta en la ficha', () => {
  beforeEach(() => window.localStorage.clear());

  it('un consejo sin pregunta no muestra la sección', async () => {
    await renderApp('/tip/SCR-12');
    expect(screen.queryByRole('region', { name: 'Pon a prueba lo que leíste' })).not.toBeInTheDocument();
  });

  it('se rotula como borrador, es opcional y no bloquea marcar la misión', async () => {
    await renderApp('/tip/SCR-01');
    const quiz = screen.getByRole('region', { name: 'Pon a prueba lo que leíste' });
    expect(within(quiz).getByText(/pendiente de aprobación del Product Owner/)).toBeInTheDocument();
    expect(within(quiz).getByText(/Es opcional/)).toBeInTheDocument();
    expect(within(quiz).getByRole('button', { name: 'Comprobar respuesta' })).toBeDisabled();
    // Sin contestar, la misión se puede marcar igual.
    await userEvent.setup().click(screen.getByRole('button', { name: 'Marcar como comprendida' }));
    expect(getBrowserRepository().getCompleted()).toHaveProperty('SCR-01');
    expect(getBrowserRepository().getQuizAnswers()).toEqual({});
  });

  it('una respuesta incorrecta da retroalimentación y se guarda; se puede intentar otra vez', async () => {
    const user = userEvent.setup();
    const question = getQuestionForTip('SCR-01');
    const wrong = question.options.findIndex((_, index) => index !== question.correctIndex);
    await renderApp('/tip/SCR-01');
    const quiz = screen.getByRole('region', { name: 'Pon a prueba lo que leíste' });
    await user.click(within(quiz).getByRole('radio', { name: question.options[wrong] }));
    await user.click(within(quiz).getByRole('button', { name: 'Comprobar respuesta' }));
    expect(within(quiz).getByText('Todavía no es la respuesta correcta.')).toBeInTheDocument();
    expect(within(quiz).getByText(question.feedback)).toBeInTheDocument();
    expect(getBrowserRepository().getQuizAnswers()['SCR-01'].correct).toBe(false);

    await user.click(within(quiz).getByRole('button', { name: 'Intentar otra vez' }));
    expect(within(quiz).getAllByRole('radio')[0]).toHaveFocus();
    await user.click(within(quiz).getByRole('radio', { name: question.options[question.correctIndex] }));
    await user.click(within(quiz).getByRole('button', { name: 'Comprobar respuesta' }));
    expect(within(quiz).getByText('Respuesta correcta.')).toBeInTheDocument();
    expect(getBrowserRepository().getQuizAnswers()['SCR-01'].correct).toBe(true);
  });

  it('al volver a la ficha muestra el resultado guardado', async () => {
    getBrowserRepository().saveQuizAnswer({ id: 'SCR-01', correct: true, at: new Date(2026, 10, 14, 10) });
    await renderApp('/tip/SCR-01');
    const quiz = screen.getByRole('region', { name: 'Pon a prueba lo que leíste' });
    expect(within(quiz).getByText('Respuesta correcta.')).toBeInTheDocument();
    expect(within(quiz).queryByRole('button', { name: 'Comprobar respuesta' })).not.toBeInTheDocument();
  });
});

describe('panel y reinicio en Mi progreso', () => {
  beforeEach(() => window.localStorage.clear());

  it('muestra las preguntas contestadas y correctas por enfoque', async () => {
    const repository = getBrowserRepository();
    repository.saveQuizAnswer({ id: 'SCR-01', correct: true, at: new Date(2026, 10, 14, 10) });
    repository.saveQuizAnswer({ id: 'SCR-02', correct: false, at: new Date(2026, 10, 14, 11) });
    await renderApp('/progreso');
    const scrumTotal = getQuestions().filter((question) => getTipById(question.tipId).framework === 'scrum').length;
    expect(screen.getByText(`Preguntas de práctica: 2 de ${scrumTotal} contestadas · 1 correctas`)).toBeInTheDocument();
    expect(screen.getByText(/no mide cuánto aprendiste/)).toBeInTheDocument();
  });

  it('reiniciar pide confirmación, se puede cancelar y no borra el historial', async () => {
    const user = userEvent.setup();
    const repository = getBrowserRepository();
    repository.recordReading({ id: 'SCR-01', at: new Date(2026, 10, 14, 9) });
    repository.markCompleted({ id: 'SCR-01', at: new Date(2026, 10, 14, 10) });
    repository.saveQuizAnswer({ id: 'SCR-01', correct: true, at: new Date(2026, 10, 14, 10) });
    await renderApp('/progreso');

    await user.click(screen.getByRole('button', { name: 'Reiniciar progreso' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('button', { name: 'Reiniciar progreso' })).toHaveFocus();
    expect(repository.getCompleted()).toHaveProperty('SCR-01');

    await user.click(screen.getByRole('button', { name: 'Reiniciar progreso' }));
    await user.click(screen.getByRole('button', { name: 'Sí, reiniciar' }));
    expect(repository.getCompleted()).toEqual({});
    expect(repository.getQuizAnswers()).toEqual({});
    expect(repository.getHistory()).toHaveLength(1);
    expect(screen.getByText('Listo: tu progreso se reinició.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reiniciar progreso' })).toHaveFocus();
  });
});
