export const getSession = async () => {
  const url = `/api/auth/session`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    cache: "no-cache",
  });

  const session = await response.json();
  // console.log(url);
  // console.log(session);
  if (Object.entries(session).length === 0) return null;
  else return session;
};
