// Import the functions you need from the SDKs you need
import {
  AnalyticsCallOptions,
  getAnalytics,
  Item,
  logEvent,
} from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { LeaderboardEntry } from "../types/LeaderboardEntry";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAoXpusigmJNh1e2u8TrqlAn6B9tmykaNE",
  authDomain: "a-silly-little-game.firebaseapp.com",
  projectId: "a-silly-little-game",
  storageBucket: "a-silly-little-game.appspot.com",
  messagingSenderId: "838619812330",
  appId: "1:838619812330:web:27c1672bec604ca3572293",
  measurementId: "G-CN4G3E3SCM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const database = getFirestore();

export async function postScore(name: string, score: number) {
  if (typeof name !== "string") return;
  if (typeof score !== "number") return;

  await addDoc(collection(database, "leaderboard"), { name, score });
}

export async function getLeaderboard() {
  const topScoresQuery = query(
    collection(database, "leaderboard"),
    orderBy("score", "asc"),
    limit(3)
  );

  const docs = await getDocs(topScoresQuery);
  const toReturn: LeaderboardEntry[] = [];
  docs.forEach((item) => {
    console.log(item.data());
    toReturn.push(item.data() as LeaderboardEntry);
  });
  return toReturn;
}

export function logAnalyticsEvent(
  eventName: string,
  eventParams?:
    | {
        [key: string]: any;
        coupon?: string | undefined;
        currency?: string | undefined;
        items?: Item[] | undefined;
        payment_type?: string | undefined;
        value?: number | undefined;
      }
    | undefined,
  options?: AnalyticsCallOptions | undefined
) {
  logEvent(analytics, eventName, eventParams, options);
}
