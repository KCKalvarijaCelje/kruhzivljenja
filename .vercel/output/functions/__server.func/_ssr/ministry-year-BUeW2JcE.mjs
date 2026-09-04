function currentMinistryStartYear(now = /* @__PURE__ */ new Date()) {
  const y = now.getFullYear();
  return Math.max(y, 2026);
}
function ministryLabel(startYear) {
  return `${startYear}/${startYear + 1}`;
}
function ministryMonths(startYear) {
  const arr = [];
  for (let m = 8; m <= 11; m++) arr.push({ year: startYear, month: m });
  for (let m = 0; m <= 7; m++) arr.push({ year: startYear + 1, month: m });
  return arr;
}
export {
  ministryMonths as a,
  currentMinistryStartYear as c,
  ministryLabel as m
};
