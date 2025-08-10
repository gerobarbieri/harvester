const DestinationChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ['bg-primary', 'bg-primary-medium', 'bg-primary-dark'];
    const strokeColors = ['#60bc8c', '#4aa978', '#349563'];

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#e6e6e6" strokeWidth="4" />
                    {data.reduce((acc, item, index) => {
                        const percentage = (item.value / total) * 100;
                        const strokeDasharray = `${percentage} ${100 - percentage}`;
                        const strokeDashoffset = 25 - acc;

                        return (
                            <>
                                <circle
                                    key={index}
                                    cx="18"
                                    cy="18"
                                    r="15.9155"
                                    fill="transparent"
                                    stroke={strokeColors[index % strokeColors.length]}
                                    strokeWidth="4"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-300"
                                />
                                {acc + percentage}
                            </>
                        );
                    }, 0)}
                </svg>
            </div>
            <div className="w-full space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between space-x-3">
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                            <span className="text-sm text-text-secondary">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-text-primary">{((item.value / total) * 100).toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DestinationChart;