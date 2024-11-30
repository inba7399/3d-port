import React from "react";
import "./style.css";
import { motion } from "framer-motion";

export default function Button({name,onclick,widthPercentage}) {
  return (
    <div>
      <motion.button
        style={{width:`${widthPercentage}%`}}
        onClick={onclick}
        className="px-20  py-2 rounded-md relative btn"
        initial={{ "--x": "100%", scale: 1 }}
        animate={{ "--x": "-100%" }}
        whileTap={{ scale: 0.6 }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          repeatDelay: 1,
          type: "spring",
          stiffness: 20,
          damping: 15,
          mass: 2,
          scale: {
            type: "spring",
            stiffness: 4,
            damping: 1,
            mass: 0.1,
          },
        }}
      >
        <span  className="text-neutral-100 tracking-wide font-light h-full w-full block relative Btn-mask">
          {name}
        </span>
        <span className="block absolute inset-0 rounded-md p-px Btn-broder" />
      </motion.button>
    </div>
  );
}
