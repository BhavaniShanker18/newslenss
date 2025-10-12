import { Player } from '@lottiefiles/react-lottie-player';

interface LottieAnimationProps {
  animationUrl?: string;
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export const LottieAnimation = ({
  animationUrl = "https://lottie.host/4b3d3b3d-3b3d-4b3d-8b3d-3b3d3b3d3b3d/qQqQqQqQ.json",
  width = 300,
  height = 300,
  loop = true,
  autoplay = true,
  className = ""
}: LottieAnimationProps) => {
  return (
    <Player
      autoplay={autoplay}
      loop={loop}
      src={animationUrl}
      style={{ width, height }}
      className={className}
    />
  );
};

export const AnimationUrls = {
  analyzing: "https://lottie.host/embed/a7468f1f-7f96-4039-bf4c-8f32b8e3e7e8/iyYhLqCvbA.json",
  success: "https://lottie.host/embed/b9f3e1e8-4f2f-4e3f-8f3f-3f3f3f3f3f3f/qQqQqQqQ.json",
  error: "https://lottie.host/embed/c8e2d3f4-5g3h-4i5j-9k6l-4m7n8o9p0q1r/rRrRrRrR.json",
  shield: "https://lottie.host/embed/d9f4e5g6-6h4i-5j6k-0l7m-5n8o9p0q1r2s/sSsSsSsS.json",
  brain: "https://lottie.host/embed/e0g5f6h7-7i5j-6k7l-1m8n-6o9p0q1r2s3t/tTtTtTtT.json",
};
