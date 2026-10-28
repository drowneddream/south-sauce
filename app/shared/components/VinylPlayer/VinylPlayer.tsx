"use client";

import { useEffect, useRef, useState } from "react";

type Track = {
  src: string;
  title?: string;
};

type VinylPlayerProps = {
  tracks?: Track[];
  cover?: string;
};

function shuffleTracks<T>(tracks: T[]): T[] {
  const result = [...tracks];
  const randomBuffer = new Uint32Array(1);

  for (let i = result.length - 1; i > 0; i--) {
    crypto.getRandomValues(randomBuffer);

    const j = randomBuffer[0] % (i + 1);

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

const initTracks: Track[] = [
  {
  src: "/snips/snip_1.mp3",
  title: 'snip_1',
  },
  {
  src: "/snips/snip_2.mp3",
  title: 'snip_2',
  },
  {
  src: "/snips/snip_3.mp3",
  title: 'snip_3',
  },
  {
  src: "/snips/snip_4.mp3",
  title: 'snip_4',
  },
  {
  src: "/snips/snip_5.mp3",
  title: 'snip_5',
  },
  {
  src: "/snips/snip_6.mp3",
  title: 'snip_6',
  },
];

const initialCover = "/images/disk.png";

export default function VinylPlayer({
  tracks = initTracks,
  cover = initialCover,
}: VinylPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const preloadedSrcRef = useRef<string | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const discRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const angleRef = useRef(0);
  const startedAtRef = useRef(0);
  const isPlayingRef = useRef(false);
  const [shuffledTracks] = useState(() => shuffleTracks(tracks));
  const currentTrack = shuffledTracks[trackIndex];

  const ROTATION_DURATION = 3000;

  const startRotation = () => {
    const disc = discRef.current;
    if (!disc) return;

    animationRef.current?.cancel();

    isPlayingRef.current = true;
    startedAtRef.current = performance.now();

    animationRef.current = disc.animate(
      [
        { transform: `rotate(${angleRef.current}deg)` },
        { transform: `rotate(${angleRef.current + 360}deg)` },
      ],
      {
        duration: ROTATION_DURATION,
        iterations: Infinity,
        easing: "linear",
      }
    );

    animationRef.current.currentTime =
      (angleRef.current / 360) * ROTATION_DURATION;
  };

  const stopRotation = () => {
    const disc = discRef.current;
    const animation = animationRef.current;

    if (!disc || !animation) return;

    const computed = getComputedStyle(disc).transform;
    const matrix = new DOMMatrix(computed);

    let angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    angleRef.current = angle;
    animation.cancel();
    animationRef.current = null;

    disc.animate(
      [
        { transform: `rotate(${angle}deg)` },
        { transform: "rotate(0deg)" },
      ],
      {
        duration: 700,
        easing: "ease-out",
        fill: "forwards",
      }
    );

    angleRef.current = 0;
    isPlayingRef.current = false;
  };

  const preloadNextTrack = () => {
    const nextIndex = trackIndex + 1;

    if (nextIndex >= shuffledTracks.length) return;

    const nextSrc = shuffledTracks[nextIndex].src;

    if (preloadedSrcRef.current === nextSrc) return;

    const audio = new Audio();
    audio.preload = "auto";
    audio.src = nextSrc;

    nextAudioRef.current = audio;
    preloadedSrcRef.current = nextSrc;
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(audio.duration)) return;

    const remaining = audio.duration - audio.currentTime;

    if (remaining <= 5) {
      preloadNextTrack();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying || !currentTrack) return;

    audio.src = currentTrack.src;
    audio.currentTime = 0;

    audio.play().catch((error) => {
      console.error("Ошибка воспроизведения аудио:", error);
      setIsPlaying(false);
    });
  }, [trackIndex, isPlaying, currentTrack]);

  const handleClick = () => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;

    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setTrackIndex((index) =>
        index + 1 < tracks.length ? index + 1 : 0
      );
      setIsFinished(false);
      stopRotation();
      return;
    }

    if (isFinished) {
      setTrackIndex(0);
      setIsFinished(false);
      stopRotation();
    }

    setIsPlaying(true);
    startRotation();
  };

  const handleEnded = () => {
    if (trackIndex < tracks.length - 1) {
      setTrackIndex((index) => index + 1);
    } else {
      setIsPlaying(false);
      setIsFinished(true);
      stopRotation();
    }
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current?.removeAttribute("src");
      audioRef.current?.load();

      nextAudioRef.current?.pause();
      nextAudioRef.current?.removeAttribute("src");
      nextAudioRef.current?.load();

      audioRef.current = null;
      nextAudioRef.current = null;
    };
  }, []);

  if (tracks.length === 0) return null;

  return (
    <div className={"h-screen flex flex-col justify-center items-center gap-4"}>
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        preload="none"
      />

      <button
        type="button"
        onClick={handleClick}
        aria-label={isPlaying ? "Остановить музыку" : "Включить музыку"}
        aria-pressed={isPlaying}
        className="block mx-auto rounded-full focus-visible:outline-none relative"
      >
      <div
        ref={discRef}
        className="aspect-square w-64 max-w-full rounded-full
          bg-cover bg-center bg-no-repeat select-none"
        style={{
          backgroundImage: `url("${cover}")`,
        }}
      />
      {/* TODO решить проблему с обводкой */}
      {/* <div
        aria-hidden="true"
        className="absolute pointer-events-none w-[261%] h-[246%] left-[-74%] top-[-77%] bg-center bg-no-repeat bg-size-[100%_100%]"
        style={{
          backgroundImage: `url("${obvodka}")`,
        }}
      /> */}
      </button>
      <div className="text-center text-4xl text-(--text-color)">нажми<br />на диск</div>
    </div>
  );
};
