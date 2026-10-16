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

const basePath = "/south-sauce";

const initTracks: Track[] = [
  {
  src: `${basePath}/snips/snip_1.mp3`,
  title: 'snip_1',
  },
  {
  src: `${basePath}/snips/snip_2.mp3`,
  title: 'snip_2',
  },
  {
  src: `${basePath}/snips/snip_3.mp3`,
  title: 'snip_3',
  },
  {
  src: `${basePath}/snips/snip_4.mp3`,
  title: 'snip_4',
  },
  {
  src: `${basePath}/snips/snip_5.mp3`,
  title: 'snip_5',
  },
  {
  src: `${basePath}/snips/snip_6.mp3`,
  title: 'snip_6',
  },
];

const initialCover = `${basePath}/images/disk.png`;

export default function VinylPlayer({
  tracks = initTracks,
  cover = initialCover,
}: VinylPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const discRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const angleRef = useRef(0);
  const startedAtRef = useRef(0);
  const isPlayingRef = useRef(false);

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying || !tracks[trackIndex]) return;

    audio.src = tracks[trackIndex].src;
    audio.currentTime = 0;

    audio.play().catch((error) => {
      console.error("Ошибка воспроизведения аудио:", error);
      setIsPlaying(false);
    });
  }, [trackIndex, isPlaying, tracks]);

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
      audioRef.current = null;
    };
  }, []);

  if (tracks.length === 0) return null;

  return (
    <div className={"h-screen flex flex-col justify-center align-middle"}>
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        preload="metadata"
      />

      <button
        type="button"
        onClick={handleClick}
        aria-label={isPlaying ? "Остановить музыку" : "Включить музыку"}
        aria-pressed={isPlaying}
        className="block mx-auto rounded-full focus-visible:outline-none"
      >
      <div
        ref={discRef}
        className="aspect-square w-64 max-w-full rounded-full
          bg-cover bg-center bg-no-repeat select-none"
        style={{
          backgroundImage: `url("${cover}")`,
        }}
      />
      </button>
    </div>
  );
}