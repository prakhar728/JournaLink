import React, { useEffect, useState } from 'react'
import Navbar from '../../../components/Navbar'
import styles from "./Separate.module.css";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Database } from '@tableland/sdk';
import { newsSchema, newsTableName } from '../../../tableland';
import Image from 'next/image';
import heart from "../../../assets/Heart.png";
import { useAccount } from 'wagmi';
const index = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [newsID, setnewsID] = useState("");
  const [news, setnews] = useState<newsSchema[]>([])
  const db = new Database<newsSchema>();
  const [activeSlide, setActiveSlide] = useState(1);
  const getNews = async (newsid: string) => {
    const { results } = await db.prepare<newsSchema>(`SELECT * FROM ${newsTableName} WHERE newsID=${newsid}  ; `).all();
    console.log(results);
    setnews(results)
    console.log((new Date(parseInt(results[0].DOC))).toLocaleString());


  }
  useEffect(() => {

    if (router.isReady) {
      if (typeof router.query.newsid == "string") {
        setnewsID(router.query.newsid)
        console.log(router.query.newsid);
        getNews(router.query.newsid);
      }

    }
  }, [router.isReady])
  const likePost = async (e: any) => {
    e.preventDefault();
    const newLikes = news[0].likes + 1;
    console.log(newLikes);

    try {
      if (address) {
        const { meta: insert } = await db
          .prepare(
            `UPDATE ${newsTableName}
            SET likes = ${news[0].likes + 1}
            WHERE newsID=${news[0].newsID};`
          )
          .run()
        await insert.txn?.wait();
      }


    } catch (error) {
      console.log(error);

    }
  }
  const handleSlideChange = () => {
    setActiveSlide(activeSlide === 1 && news[0].videoURL!=""  ? 2 : 1);
  };

  return (
    <div>
      <Navbar />
      {news.length != 0 &&
        <div className={styles.newsWrapper}>
          <div className={styles.goBack}>
            <Link href="/app/news">
              &#60; Go Back
            </Link>
          </div>
          <div className={styles.upper1}>
            <div className={styles.left}>
              <div className={styles.slideshowContainer}>
                <div className={`${styles.slide} ${activeSlide === 1 ? styles.active : ''}`}>
                  <Image src={news[0].thumbnail} alt="News Thumbnail" width={300} height={300} />
                </div>
                <div className={`${styles.slide} ${activeSlide === 2 ? styles.active : ''}`}>
                  <video controls>
                    <source src={news[0].videoURL} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <button className={styles.slideButton} onClick={handleSlideChange}>
                &#60;
                </button>
              </div>
              
            </div>
            <div className={styles.right}>
              <h2><q>{news[0].headline}</q></h2>
              <div className={styles.info}>
                <span>By {news[0].creatoraddress.substring(0, 6) + "..." + news[0].creatoraddress.substring(37,)}</span>
                <span>{(new Date(parseInt(news[0].DOC))).toLocaleString()}</span>
              </div>
              <div className={styles.likes}>
                {news[0].likes} likes
              </div>
              <div className={styles.likeButton}>
                <button onClick={likePost}>Like <Image src={heart} alt="Heart" /></button>
              </div>
            </div>
          </div>
          <div className={styles.lower}>
            <p>
              {news[0].newsinfo}
            </p>
          </div>
        </div>
      }

    </div>
  )
}

export default index