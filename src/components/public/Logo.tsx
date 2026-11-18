import principal from "../../assets/brand/logo-principal.svg";
import surVert from "../../assets/brand/logo-sur-vert.svg";
import surEncre from "../../assets/brand/logo-sur-encre.svg";

const sources = { principal, "sur-vert": surVert, "sur-encre": surEncre } as const;

interface Props {
  /** principal : fonds clairs · sur-vert : fonds verts · sur-encre : fonds sombres */
  variant?: keyof typeof sources;
  className?: string;
}

export default function Logo({ variant = "principal", className = "h-10 w-auto" }: Props) {
  return <img src={sources[variant]} alt="Jokko Business" className={className} />;
}
