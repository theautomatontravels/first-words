import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Hello world!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      Hello world!
    </div>
  );
}
