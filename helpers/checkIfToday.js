const checkIfToday = (date) => {
  const currentDay = new Date().toDateString();
  const dateToCheck = new Date(date).toDateString();

  return currentDay === dateToCheck;
};

module.exports = checkIfToday;
