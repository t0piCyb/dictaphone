export function getDurationFormatted(milliseconds: number) {
  const minutes = milliseconds / 1000 / 60;
  const seconds = Math.round((minutes - Math.floor(minutes)) * 60);
  return seconds < 10
    ? `${Math.floor(minutes)}:0${seconds}`
    : `${Math.floor(minutes)}:${seconds}`;
}
