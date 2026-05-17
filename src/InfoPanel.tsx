import { useState } from "react";

export default function InfoPanel() {
  const [minimized, setMinimized] = useState(true);

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
          onClick={() => setMinimized((v) => !v)}
          className="ml-4 text-gray-400 hover:text-gray-700 text-xs leading-none"
          aria-label={minimized ? "Expand" : "Minimize"}
        >
          {minimized ? "▲" : "▼"}
        </button>
      </div>

      {!minimized && (
        <div className="px-4 pb-4 text-xs text-gray-600 space-y-2 border-t border-gray-100 pt-3">
          <p className="leading-relaxed">
            According to the{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-black"
              href="https://www.census.gov/programs-surveys/acs.html"
            >
              2024 American Community Survey
            </a>{" "}
            (ACS), there were{" "}
            <span className="font-semibold text-gray-800">
              1,680,520 Japanese Americans
            </span>{" "}
            in the United States — about{" "}
            <span className="font-semibold text-gray-800">0.5%</span> of the
            total population of 338,156,808.
          </p>
          <p className="leading-relaxed">
            Japanese Americans here includes people who self-identified as
            Japanese alone, or Japanese in combination with one or more other
            racial and ethnic groups. ACS figures are estimates based on sample
            data.
          </p>
          <p className="mt-2 leading-relaxed text-gray-500">
            Source:{" "}
            <a
              href="https://data.census.gov/table/ACSDT5Y2024.B02018"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-black"
            >
              2021-2024 US Census ACS 5-Year Estimates, Table B02018
            </a>
          </p>
          <p className="leading-relaxed text-gray-500">
            Daigo Fujiwara-Smith for Pacific Citizen/JACL. Originally published
            May 2026.
          </p>
          <a
            href="https://login.jacl.org/general/register_member_type.asp"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block w-full text-center bg-red-700 hover:bg-red-800 text-white text-xs font-semibold uppercase tracking-widest py-2 px-3 transition-colors"
          >
            Donate / Join JACL
          </a>
        </div>
      )}
    </div>
  );
}
