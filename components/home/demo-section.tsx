import { Pizza } from "lucide-react";
import { MotionH3 } from "../common/motion.wrapper";

export default function DemoSection() {
    return (
      <section className="relative">
        <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-12">
        
            <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl"
        >
          <div
            className="relative left-[calc(50%*3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0%, 72.2% 2%, 52.5% 32.5%, 60.6% 22.4%, 52.4% 68.1%, 47.5% 58.8%, 35.5% 46.2%, 24.6% 56.1%, 0% 51.1%, 5.4% 68.5%, 9% 100%, 27.6% 76.3%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-gray-100/80 backdrop-blur-xs border border-gray-500/20 mb-4">
              <Pizza className="w-6 h-6 text-rose-500"/>
            </div>
            <div className="text-center mb-16">
              <MotionH3 
                intial={{ y:20, opacity: 0 }}
                whileInView={{ y:0, opacity: 1}}
                transition={{ duration: 0.5, delay: 0.2}}
                className="font-bold text-3xl max-w-2xl mx-auto px-4 sm:px-6">Watch how Summary transforms <span className="bg-linear-to-r from-rose-500 to-rose-700 bg-clip-text text-transparent ">this Next.js course PDF</span>{' '} into an easy-to-read summary!</MotionH3>
            <div className="flex justify-center items-center px-2 sm:px-4 lg:px-6">
                  {/*Summary viewer */}
            </div>
            </div>
            </div>  
        </div>
      </section>
    );
  }
  