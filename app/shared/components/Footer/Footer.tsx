import Link from "next/link";
import { FC } from "react";

  export const Footer: FC = () => {
    return (
      <footer className="flex flex-col gap-10 justify-center align-middle mb-12.5 px-16 max-[375px]:px-6">
        <p className="text-[40px] text-center text-(--text-color)">СКОРО</p>
        <p className="text-[20px] text-center text-(--text-color)">тгк: <Link href={"https://t.me/saucenovoross"} rel="noopener noreferrer" target="_blank" className="text-(--hover-color)" >t.me/saucenovoross</Link></p>
      </footer>
    );
};
