"use client";
import React from "react";

const Loader = () => {
  return (
    <main className="flex min-h-screen w-full items-center justify-center ">
      <div className="wrapper">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="shadow"></div>
        <div className="shadow"></div>
        <div className="shadow"></div>
      </div>
    </main>
  );
};

export default Loader;
