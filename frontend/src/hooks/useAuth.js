import { useEffect, useState } from "react";
import { getProfile } from "../services/api";

export function useAuth() {
  const [auth, setAuth] = useState("loading");

  useEffect(() => {
    async function check() {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setAuth("not_logged");
        return;
      }

      try {
        const res = await getProfile(token);
        if (res && res.user?.id) {
          setAuth("logged");
        } else {
          setAuth("not_logged");
        }
      } catch (err) {
        setAuth("not_logged");
        localStorage.removeItem("token");
      }
    }
    check();
  }, []);

  return auth;
}
