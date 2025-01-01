
async function generateLast12MonthsData(model) {
    const last12Months = [];
    const currentDate = new Date();

    // Loop through the last 12 months
    for (let i = 12; i > 0; i--) {
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        
         // Log the dates to see if they are correct
        //  console.log("Start Date:", startDate);
        //  console.log("End Date:", endDate);

        // Format the date as "MMM YYYY" (e.g., "Dec 2024")
        const monthYear = endDate.toLocaleDateString('default', {
            month: 'short',
            year: 'numeric',
        });

        const count = await model.countDocuments({
            createdAt: {
                $gte: startDate,
                $lt: endDate,
            },
        });

        last12Months.push({ month: monthYear, count });
    }

    return { last12Months };
}

export { generateLast12MonthsData };

