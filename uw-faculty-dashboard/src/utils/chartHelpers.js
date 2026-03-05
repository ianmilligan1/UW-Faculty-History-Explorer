export function makeChartClickHandler(dataArray, dataKeys, setPinnedData) {
  return (chartData) => {
    if (!chartData?.activeLabel) return;
    const year = chartData.activeLabel;
    const row = dataArray.find(d => d.year === year);
    if (!row) return;
    const payload = dataKeys.map(k => ({ name: k.name, value: row[k.key], color: k.color }));
    setPinnedData({ year, payload });
  };
}
