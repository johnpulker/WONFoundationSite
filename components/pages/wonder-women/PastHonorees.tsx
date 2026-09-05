"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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

export default function PastHonorees() {
  // Duplicate names to create seamless loop
  const duplicatedNames = [...honoreeNames, ...honoreeNames, ...honoreeNames];
  
  // Split into columns with more names per column for horizontal layout
  // More names per column = fewer columns = more horizontal scrolling
  const namesPerColumn = 35;
  const columns: string[][] = [];
  
  for (let i = 0; i < duplicatedNames.length; i += namesPerColumn) {
    columns.push(duplicatedNames.slice(i, i + namesPerColumn));
  }

  return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Section Header */}
        <div className="text-center mb-2 md:mb-3">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl text-primary"
            style={{
              fontFamily: 'var(--font-cursive)',
              fontWeight: 600,
            }}
          >
          WONder Woman Award Recipients 1986-2025
          </motion.h2>
        </div>

      {/* Marquee Container */}
      <div className="relative w-full max-w-7xl mx-auto">
        {/* Marquee Frame Background */}
        <div className="relative w-full aspect-[16/9] max-h-[700px] md:max-h-[800px] lg:max-h-[900px]">
          <Image
            src="/marqueebggone.png"
            alt="Marquee Sign"
            fill
            className="object-contain"
            priority
          />
          
          {/* Names Scrolling Area - Positioned inside the marquee frame */}
          <div className="absolute top-[22%] bottom-[25%] left-[8%] right-[8%] md:top-[24%] md:bottom-[27%] md:left-[10%] md:right-[10%] lg:top-[26%] lg:bottom-[28%] lg:left-[12%] lg:right-[12%] flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full flex items-center px-2 md:px-4 py-8 md:py-10">
              {/* Scrolling Names Container */}
              <div className="absolute inset-0 flex gap-4 md:gap-6 lg:gap-8" style={{ top: '1rem', bottom: '1rem' }}>
                {/* First set of columns */}
                <div className="flex gap-4 md:gap-6 lg:gap-8 animate-marquee-horizontal">
                  {columns.map((column, colIndex) => (
                    <div
                      key={`col-1-${colIndex}`}
                      className="flex flex-col gap-1 md:gap-1.5 min-w-[110px] md:min-w-[130px] lg:min-w-[150px]"
                    >
                      {column.map((name, nameIndex) => (
                        <div
                          key={`name-1-${colIndex}-${nameIndex}`}
                          className="text-center neon-text whitespace-nowrap"
                          style={{
                            fontFamily: 'var(--font-cursive)',
                            fontSize: 'clamp(0.75rem, 1.5vw, 1.2rem)',
                            color: '#871c1c',
                            fontWeight: 500,
                            lineHeight: '1.5',
                            paddingTop: '0.25rem',
                            paddingBottom: '0.25rem',
                          }}
                        >
                          {name}
                            </div>
                      ))}
                            </div>
                  ))}
                        </div>
                        
                {/* Duplicate set for seamless loop */}
                <div className="flex gap-4 md:gap-6 lg:gap-8 animate-marquee-horizontal">
                  {columns.map((column, colIndex) => (
                    <div
                      key={`col-2-${colIndex}`}
                      className="flex flex-col gap-1 md:gap-1.5 min-w-[110px] md:min-w-[130px] lg:min-w-[150px]"
                    >
                      {column.map((name, nameIndex) => (
                        <div
                          key={`name-2-${colIndex}-${nameIndex}`}
                          className="text-center neon-text whitespace-nowrap"
                          style={{
                            fontFamily: 'var(--font-cursive)',
                            fontSize: 'clamp(0.75rem, 1.5vw, 1.2rem)',
                            color: '#871c1c',
                            fontWeight: 500,
                            lineHeight: '1.5',
                            paddingTop: '0.25rem',
                            paddingBottom: '0.25rem',
                          }}
                        >
                          {name}
                        </div>
                      ))}
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
                  </div>
                </div>

      {/* Legend/Key */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center mt-8 md:mt-10"
      >
        <div className="inline-flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm md:text-base text-neutral-600">
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

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="text-center mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Link
          href="/wonder-women/archive"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#871c1c] to-[#a02323] hover:from-[#a02323] hover:to-[#871c1c] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
        >
          <span className="text-lg md:text-xl">Explore the Archive</span>
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <Link
          href="/wonder-women/all-recipients"
          className="inline-flex items-center gap-3 px-8 py-4 border-2 border-[#871c1c] text-[#871c1c] hover:bg-[#871c1c] hover:text-white font-semibold rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
        >
          <span className="text-lg md:text-xl">View Complete List</span>
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </motion.div>
    </motion.div>
  );
}
