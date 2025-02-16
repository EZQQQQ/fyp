// frontend/src/exporters/groupParticipation.js

/**
 * Groups an array of participation objects by student.
 *
 * Each raw participation object is expected to include:
 *   - studentId: a unique identifier for the student
 *   - studentName: the student's name
 *   - studentEmail: the student's email address
 *   - _id: the task result identifier (to be used as taskId)
 *   - studentProgress: the student's score/progress for the task
 *   - total: total possible score for the task
 *   - type: the type of task (e.g., "votes", "postings", "quizzes")
 *
 * @param {Array} participationArray - Raw participation data.
 * @returns {Array} - Array of objects grouped by student, each of the form:
 *   {
 *     studentId: string,
 *     studentName: string,
 *     studentEmail: string,
 *     results: [
 *       { taskId: string, score: number, total: number, type: string },
 *       ...
 *     ]
 *   }
 */
export const groupParticipationByStudent = (participationArray) => {
    const grouped = {};

    participationArray.forEach((item) => {
        // Require that item has studentId, studentName, and studentEmail
        const id = item.studentId;
        if (!grouped[id]) {
            grouped[id] = {
                studentId: id,
                studentName: item.studentName,
                studentEmail: item.studentEmail,
                results: [],
            };
        }
        grouped[id].results.push({
            taskId: item._id,
            score: Number(item.studentProgress) || 0,
            total: Number(item.total) || 0,
            type: item.type,
        });
    });

    return Object.values(grouped);
};
