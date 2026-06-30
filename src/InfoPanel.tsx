import { useState } from "react";

const SHARE_URL =
  "https://pacificcitizen.org/interactives/japanese-american-population/";
const SHARE_TEXT =
  "1.68 million Japanese Americans — explore where they live, county by county. Interactive map by @JACL_National";

function ShareButton() {
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  function handleClick() {
    if (canNativeShare) {
      navigator.share({ title: "Japanese American Population Map", text: SHARE_TEXT, url: SHARE_URL });
    } else {
      navigator.clipboard.writeText(SHARE_URL).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex-1 text-center border border-gray-300 hover:border-gray-600 text-gray-600 hover:text-gray-900 text-xs font-semibold uppercase tracking-widest py-2 transition-colors"
    >
      {copied ? "Copied!" : "Share"}
    </button>
  );
}

type Props = {
  open: boolean;
  onToggle: () => void;
};

export default function InfoPanel({ open, onToggle }: Props) {
  return (
    <div className="absolute top-4 left-4 z-10 bg-white/95 shadow-md w-72 text-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="font-bold text-sm uppercase tracking-widest leading-tight">
          Japanese American
          <br />
          Population 2024
        </h1>
        <button
          type="button"
          onClick={onToggle}
          className="ml-4 text-xs text-gray-400 hover:text-gray-900 leading-none"
          aria-label={open ? "Minimize" : "Expand"}
        >
          {open ? "CLOSE" : "INFO"}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 text-xs text-gray-600 space-y-2 border-t border-gray-100 pt-3">
          <div>
            <div className="flex justify-between text-gray-800 mt-0.5">
              Percent of total population:
            </div>
            <div
              className="h-3 w-full"
              style={{
                background:
                  "linear-gradient(to right, #efedf5, #bcbddc, #756bb1,  #1b021d, #bd001c)",
              }}
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <p className="leading-relaxed">
            The{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-black"
              href="https://www.census.gov/programs-surveys/acs.html"
            >
              2024 American Community Survey
            </a>{" "}
            counted{" "}
            <span className="font-semibold text-gray-800">
              1,680,520 Japanese Americans
            </span>{" "}
            — about{" "}
            <span className="font-semibold text-gray-800">0.5%</span> of the
            U.S. population — including those who identify as Japanese alone or
            in combination with one or more other racial and ethnic groups. ACS
            figures are estimates based on sample data.
          </p>
          <p className="leading-relaxed text-gray-500">
            Source:{" "}
            <a
              href="https://data.census.gov/table/ACSDT5Y2024.B02018"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-black"
            >
              2021-24 ACS 5-Yr Est. Table B02018
            </a>
          </p>
          <p className="leading-relaxed text-gray-500">
            By Daigo Fujiwara-Smith for Pacific Citizen/JACL, June 2026.
          </p>
          <div className="flex gap-2 pt-1">
            <ShareButton />
            <a
              href="https://login.jacl.org/general/register_member_type.asp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-red-700 hover:bg-red-800 text-white text-xs font-semibold uppercase tracking-widest py-2 px-3 transition-colors"
            >
              Donate / Join
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
