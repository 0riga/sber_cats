export function setDataRefresh(minutes, key) {
  const setTime = new Date(new Date().getTime() + minutes * 600);
  localStorage.setItem(key, setTime);
  console.log({ setTime });
  return setTime;
}
