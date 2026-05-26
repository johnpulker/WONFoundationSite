"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// WONder Woman Award Recipients 1986-2025
const honoreeNames = [
  "Jane Abraham",
  "Maggie Allesee",
  "Lynn Alexander",
  "Fran Anderson ^",
  "Danielle Atkinson",
  "Frances Avadenka",
  "Hon. Suzy Avery",
  "Hon. Elizabeth Bauer",
  "Hon. Alisha Bell",
  "Dr. Donna Bell",
  "Hon. Maxine Berman",
  "Barbara Bonsignore",
  "Anne Borg",
  "Kay Bowerman",
  "Dr. Diane Buffalin",
  "Hon. Patricia Hill Burnett ^",
  "Debi Cain",
  "Hon. Brenda Carter",
  "Hon. Carolyn Cassin",
  "Karen Gullberg Cook",
  "Hon. Jessica Cooper",
  "Dr. Monseta Coorington",
  "Hon. Maura Corrigan",
  "Donna Cunningham",
  "Mary Liz Curtin",
  "Hon. Diane D'Agostini",
  "Diane Dietle",
  "Tiffany Douglas",
  "Hon. Anne Doyle",
  "Dr. Shawne Duperon",
  "Hon. Debra Ehrmann",
  "Sue Ellen Eisenberg",
  "Irma Elder ^",
  "Lil Erdeljan ^",
  "Portia Fields-Anderson",
  "Rev. Faith Fowler",
  "Sonya Friedman, PhD",
  "Hon. Hilda R. Gage ^",
  "Hon. Carol Hackett Garagiola",
  "Wilma Garcia",
  "Hon. Kelly Garrett",
  "Hon. Kristina Robinson-Garrett",
  "Sally Gerak",
  "Grace Gilchrist",
  "Hon. Patricia (Pam) Godchaux",
  "Yvonne Golden",
  "Janet Good ^",
  "Hon. Lisa Gorcyca",
  "Governor Jennifer Granholm",
  "Nanci Grant",
  "Dr. LaBarbara Gregg",
  "Hon. Linda Hallmark",
  "Hon. Pat Hardy",
  "Hon. Mattie McKinney Hatchett",
  "Dr. Mona Hanna-Attisha",
  "Dr. Molly Tan Hayden",
  "Hon. Ann Heler",
  "Sandra M. Hermanoff",
  "Susan Haworth Hoeppner",
  "Joanne Holbert",
  "Ruth Elliott Holmes",
  "Hon. Gilda Jacobs",
  "Maria Johnson",
  "Mattie Johnson",
  "Linda Jolicoeur",
  "Eleanor Josaltis ^",
  "Hon. Marilyn Kelly",
  "Norma Kirkland",
  "Julie Nelson Klein",
  "Marguerite Kowaleski",
  "Hon. Kathleen Straus",
  "Myra Kruger",
  "Hon. Brenda Lawrence",
  "Diana Lewis",
  "Jacqueline Lichty",
  "Betty Lowenthal",
  "Kay Lowry",
  "Carol Lubin",
  "Pamela D. Lupo",
  "Hon. Deborah Macon **",
  "Florine Mark ^",
  "Kristina Marshall",
  "Marian McCracken",
  "Nancy McQuillan",
  "Hon. Anne Mervenne",
  "Hon. Annetta Miller",
  "Barbara Miller",
  "Hon. Judith Miller",
  "Hon. Sheryl Warren Mitchell",
  "Hon. Denise Langford Morris",
  "Faye Alexander Nelson",
  "Susan Nine ***",
  "Hon. Colleen O'Brien",
  "Millie Pastor ^",
  "Judith Pelham",
  "Ruth Peterson",
  "Hon. Nancy Philippart, PhD",
  "Hon. Wendy Potts",
  "Hon. Eileen Pulker",
  "Dr. Nydia Quiroga",
  "Rochelle Riley",
  "Hon. Geri Rinschler",
  "Dr. Carole Rizzo",
  "Donna Roberts",
  "Teresa Rodgers",
  "Virginia Rogers",
  "Hon. Jan Roncelli",
  "Hon. Harriet Rotter",
  "Rosemarie Rowney",
  "Hon. Sam Rubley Ruetenik ^",
  "Ann Marie Russell",
  "Wanda Sandifer",
  "Dr. Franzisha Schoenfeld",
  "Alice Sieloff",
  "Hon. Eleanor (Coco) Siewert",
  "Anne Gonte Silver",
  "Hon. Janice Simmons ^",
  "Teresa Singleton",
  "Linda Solomon",
  "Susu Sosnick",
  "Sue Steinhelper",
  "Kathleen Straus",
  "Hon. Barbara Talley",
  "Hon. Shelley Taub ^",
  "Hon. Jeanne Towar",
  "Judith Trepeck",
  "Paula Tutman",
  "Casandra Ulbrich",
  "Hon. Cynthia von Oyen",
  "Hon. Cynthia Walker",
  "Joan Vaughan Walker",
  "Hon. Jacquelin Washington",
  "Hon. Deirdre H. Waterman, MD",
  "Rev. Cate Waynick",
  "Hon. Kym Worthy",
  "Betty Yancey",
  "Hon. Joan E. Young",
  "Paula Zimmer",
  "Phyllis Aluto Zimmerman",
  "Hon. Edward Sosnick",
  "Frank O'Donnell",
];

export default function AllRecipientsPage() {
  // Sort names alphabetically by last name for better readability
  const sortedNames = [...honoreeNames].sort((a, b) => {
    // Extract last name (everything after the last space, ignoring special markers)
    const getLastName = (name: string) => {
      const cleanName = name.replace(/\s*\^+\s*$|\s*\*\*+\s*$/, "").trim();
      const parts = cleanName.split(/\s+/);
      return parts[parts.length - 1] || cleanName;
    };
    return getLastName(a).localeCompare(getLastName(b));
  });

  // Split into columns for better layout
  const namesPerColumn = Math.ceil(sortedNames.length / 3);
  const columns: string[][] = [];
  for (let i = 0; i < sortedNames.length; i += namesPerColumn) {
    columns.push(sortedNames.slice(i, i + namesPerColumn));
  }

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#871c1c] via-[#a02323] to-[#6b1515] py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="stars" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <text x="10" y="15" fontSize="8" fill="#E7C418" textAnchor="middle">✦</text>
            </pattern>
            <rect width="100%" height="100%" fill="url(#stars)" />
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-4"
              style={{
                fontFamily: 'var(--font-cursive)',
              }}
            >
              WONder Woman Award Recipients
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-6">
              1986-2025
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-[#E7C418]/50" />
              <div className="h-1 w-24 bg-gradient-to-r from-[#E7C418] to-[#F0D43A]" />
              <div className="h-px w-16 bg-[#E7C418]/50" />
            </div>
            <Link
              href="/wonder-women"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm md:text-base"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to WONder Women
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-6 px-8 py-4 bg-gradient-to-r from-[#871c1c]/10 via-[#E7C418]/10 to-[#871c1c]/10 rounded-2xl border border-[#E7C418]/20">
            <div>
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary">
                {sortedNames.length}
              </div>
              <div className="text-sm text-neutral-600">Total Honorees</div>
            </div>
            <div className="w-px h-12 bg-neutral-300" />
            <div>
              <div className="text-3xl md:text-4xl font-heading font-bold text-[#E7C418]">
                40
              </div>
              <div className="text-sm text-neutral-600">Years</div>
            </div>
          </div>
        </motion.div>

        {/* Names Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
        >
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="space-y-2">
              {column.map((name, nameIndex) => (
                <motion.div
                  key={`${colIndex}-${nameIndex}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: 0.5 + (colIndex * 0.1) + (nameIndex * 0.01) 
                  }}
                  className="text-lg md:text-xl text-neutral-900 font-medium py-2 border-b border-neutral-100 last:border-b-0"
                  style={{
                    fontFamily: 'var(--font-cursive)',
                  }}
                >
                  {name}
                </motion.div>
              ))}
            </div>
          ))}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 pt-8 border-t border-neutral-200"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-heading text-primary mb-4">
              Legend
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-base md:text-lg text-neutral-600">
            <span className="flex items-center gap-2">
              <span className="text-primary font-semibold">^</span>
              <span>Deceased</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-primary font-semibold">**</span>
              <span>Super WW Award</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-primary font-semibold">***</span>
              <span>Lifetime Legacy Award</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative band */}
      <div className="relative h-3 overflow-hidden mt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-[#871c1c] via-[#E7C418] to-[#871c1c]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#E7C418] via-[#871c1c] to-[#E7C418] animate-pulse opacity-50" />
      </div>
    </div>
  );
}
