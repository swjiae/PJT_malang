'use client';

import Image from 'next/image';
import WordsGrid from './WordsGrid';
import { useRef, useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { inputWordApi } from '@/apis/apis';
import { WordInfo } from '@/store/Types';
import Swal from 'sweetalert2';

export default function WordList() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLAudioElement>(null);
  const [word, setWord] = useState<string>('');
  const [words, setWords] = useState<string[]>([]);
  const { publish } = useSocket();
  const roomId: number = useSelector((state: RootState) => state.guest.pin);
  const roundInfo = useSelector((state: RootState) => state.roundInfo);
  const imagePath = useSelector((state: RootState) => state.guest.imageUrl);

  const wordinfo: WordInfo = {
    word,
    time: new Date().getTime() - roundInfo.startTime,
    roomId,
  };

  const handlePostWord = async () => {
    await inputWordApi(wordinfo);
  };

  useEffect(() => {
    // 가장 밑으로 스크롤
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // 효과음
    playerRef.current?.play();
  }, [words]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (word.trim() === '') {
        Swal.fire({
          icon: 'question',
          title: '단어를 입력해주세요!',
        });
      } else if (word == roundInfo.keyword) {
        Swal.fire({
          icon: 'error',
          title: '제시어와 다른 단어를 입력해주세요!',
        });
        setWord('');
      } else if (words.includes(word)) {
        Swal.fire({
          icon: 'error',
          title: '중복된 단어입니다!',
        });
        setWord('');
      } else if (word.length > 13) {
        Swal.fire({
          icon: 'warning',
          title: '13자 이내로 입력해주세요!',
        });
        setWord(word.slice(0, 13));
      } else {
        // 단어 추가될 때마다 전송
        publish(`/queue/manager.room.${roomId}`, 'CHECK_DB', {
          roomId,
        });
        handlePostWord();
        setWords([...words, word]);
        setWord('');
      }
    }
  };

  return (
    <div className="mt-3 sm:mt-10 w-screen flex flex-col items-center ">
      <audio ref={playerRef} src={'/audio/wordeffect.mp3'} />
      <div
        className="w-[80vw] h-[50vh] sm:h-[40vh] overflow-y-auto scrollbar-hide mb-8"
        ref={scrollRef}
      >
        <WordsGrid words={words} />
      </div>

      <div className="relative">
        <input
          className="shadow-[20px_20px_100px_2px_rgba(0,0,0,0.02)] backdrop-blur-[75px] rounded-[15px] w-[90vw] md:w-[30vw] h-[60px] text-2xl focus:outline-none py-10 pl-10 pr-24 sm:my-12"
          style={{ background: 'rgba(245, 138, 240, 0.18)' }}
          type="text"
          value={word}
          onChange={e => setWord(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <div className="group relative flex justify-center">
          <span className="absolute bottom-20 -right-4 sm:bottom-32 sm:-right-8 scale-0 transition-all rounded p-2 text-lg text-white group-hover:scale-100 bg-black">
            저는 그냥 말랑이예요✨
          </span>
          <Image
            src={imagePath}
            alt=""
            width={70}
            height={70}
            className="absolute bottom-3 sm:bottom-14 right-[20px] animate-bounce"
          />
        </div>
      </div>
    </div>
  );
}
