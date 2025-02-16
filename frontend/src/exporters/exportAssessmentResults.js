// frontend/src/exporters/exportAssessmentResults.js
import * as XLSX from "xlsx";

/**
 * Exports assessment task results to Excel.
 *
 * @param {Array} tasks - Array of assessment task objects.
 *        Each task should have:
 *          - _id: task identifier
 *          - adminLabel: display name for the task
 *          - weight: task weight (number)
 *          - total: total possible score for that task
 *          - type: the task type (e.g., "quizzes")
 *
 * @param {Array} participation - Array of grouped student participation objects.
 *        Each object is expected to have:
 *          - studentName: the student's name
 *          - studentEmail: the student's email address
 *          - results: an array of objects in the form:
 *              { taskId: string, score: number, total: number, type: string }
 *
 * The Excel layout is:
 *   Row 1: [ "Date Exported: {current date}" ]
 *   Row 2: [ ] (empty spacing)
 *   Row 3: [ "Name", "Email", "adminLabel (weight%)", "adminLabel (weight%)", ..., "Total (X%)" ]
 *   Row 4+: Each row corresponds to a student with:
 *           [ studentName, studentEmail, computed weighted score per task, total percentage ]
 *
 * For non-quiz tasks:
 *   If studentProgress < 0, count it as 0.
 *   If studentProgress > total, use total as the score.
 *   Then weighted score = (adjusted score / total) * weight.
 *
 * For quizzes:
 *   weighted score = (studentProgress / 100) * weight.
 */
export const exportAssessmentResultsToExcel = (tasks, participation) => {
    // Row 1: Date Exported
    const dateExported = new Date().toLocaleString();
    const header1 = [`Date Exported: ${dateExported}`];
    const header2 = [];

    // Calculate the total weight (for header "Total" column)
    const totalWeights = tasks.reduce((sum, task) => sum + Number(task.weight || 0), 0);

    // Header row: "Name", "Email", then each task, then Total column.
    const headerRow = ["Name", "Email"];
    tasks.forEach((task) => {
        headerRow.push(`${task.adminLabel} (${task.weight}%)`);
    });
    headerRow.push(`Total (${totalWeights}%)`);

    // Build data rows for each student.
    const dataRows = [];
    participation.forEach((student) => {
        // Build a row starting with student name and email.
        const row = [student.studentName, student.studentEmail];
        let studentWeightedTotal = 0;
        tasks.forEach((task) => {
            const result = (student.results || []).find((r) => r.taskId === task._id);
            let weightedScore = 0;
            if (Number(task.weight) === 0) {
                weightedScore = 0;
            } else if (!result || Number(task.total) === 0) {
                weightedScore = 0;
            } else {
                if (task.type === "quizzes") {
                    weightedScore = (Number(result.score) / 100) * Number(task.weight);
                } else {
                    let scoreVal = Number(result.score);
                    const totalPossible = Number(task.total);
                    if (scoreVal < 0) scoreVal = 0;
                    if (scoreVal > totalPossible) scoreVal = totalPossible;
                    weightedScore = (scoreVal / totalPossible) * Number(task.weight);
                }
            }
            weightedScore = Number(weightedScore.toFixed(2));
            row.push(weightedScore);
            studentWeightedTotal += weightedScore;
        });
        // Calculate total percentage (weighted total divided by totalWeights, multiplied by 100)
        const totalPercentage =
            totalWeights > 0 ? ((studentWeightedTotal / totalWeights) * 100).toFixed(2) : "";
        row.push(totalPercentage);
        dataRows.push(row);
    });

    // Combine all rows into one array of arrays.
    const worksheetData = [header1, header2, headerRow, ...dataRows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assessment Results");

    // Trigger the file download.
    XLSX.writeFile(workbook, `Assessment_Results_${new Date().getTime()}.xlsx`);
};
