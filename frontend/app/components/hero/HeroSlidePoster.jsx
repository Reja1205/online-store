import HeroNewArrivalsPoster from "./HeroNewArrivalsPoster";
import HeroShippingPoster from "./HeroShippingPoster";
import SummerSaleHeroPoster from "./SummerSaleHeroPoster";

const POSTER_GRADIENT = {
  summer: "from-[#fff7e6] to-[#ffe4a8]",
  shipping: "from-[#e0f2fe] to-[#bae6fd]",
  "new-arrivals": "from-[#fdf2f8] to-[#f9a8d4]",
};

const POSTER_COMPONENT = {
  summer: SummerSaleHeroPoster,
  shipping: HeroShippingPoster,
  "new-arrivals": HeroNewArrivalsPoster,
};

export default function HeroSlidePoster({ variant, className = "" }) {
  const Poster = POSTER_COMPONENT[variant];
  if (!Poster) return null;

  const gradient = POSTER_GRADIENT[variant] || "from-white to-slate-100";

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-b ${gradient} p-1.5`}
    >
      <Poster className={`h-full w-full max-h-full object-contain object-center ${className}`.trim()} />
    </div>
  );
}
