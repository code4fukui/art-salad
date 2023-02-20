export const json = async (url) => await (await fetch(url)).json();
