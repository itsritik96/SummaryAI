import { cn } from "@/lib/utils";
import { ArrowRight, CheckIcon } from "lucide-react";
import RazorpayCheckout from "../common/RazorpayCheckout";
import { MotionDiv, MotionSection } from "../common/motion.wrapper";
import { containerVariants, itemVariants } from "@/utils/constants";

type PriceType = {
    name: string;
    price: number;
    description: string;
    items: string[];
    id: string;
};

const listVariants = {
    hidden: {opacity: 0, y: -20},
    visible: {
        opacity: 1,
        x: 0,
        transition: {type: 'spring' as const, damping: 20, stiffness: 100},
    },
};

const plans = [
    {
        name: 'Basic',
        price: 0,
        description: 'Perfect for occasional use',
        items: [
            '1 PDF summary per month',
            'Standard processing speed',
            'Email support'
        ],
        id: 'basic',
    },
    {
        name: 'Pro',
        price: 99,
        description:'For Professional and Teams',
        items: [
            'Unlimited PDF summaries',
            'Priority processing',
            '24/7 priority support',
            'Markdown Export'
        ],
        id: 'pro',
    },
];

const PricingCard = ({
    name,
    price,
    description,
    items,
    id,
}: PriceType) => {
    return (
        <MotionDiv 
            variants={listVariants}
         
            className="relative w-full max-w-lg hover:scale-105 hover:transition-all duration-300">
            <div className={cn("relative flex flex-col h-full gap-4 lg:gap-8 z-10 p-8 border-[1px] border-gray-500/20 rounded-2xl",id==='pro' && 'border-rose-500 gap-5 border-2')}>
                <MotionDiv
                    variants={listVariants}
                    className="flex justify-between items-center gap-4">
                    <div>
                        <p className="text-lg lg:text-xl font-bold capitalize">{name}</p>
                        <p className="text-base-content/80 mt-2">{description}</p>
                    </div>
                </MotionDiv>

                <div className="flex gap-2">
                    <p className="text-5xl tracking-tight font-extrabold">₹{price}</p>
                    <div className="flex flex-col justify-end mb-[4px]">
                        <p className="text-xs uppercase font-semibold">INR</p>
                        <p className="text-xs">/month</p>
                    </div>
                </div>

                <MotionDiv 
                    variants={listVariants}
                    className="space-y-2.5 leading-relaxed text-base">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                            <CheckIcon size={18} />
                            <span>{item}</span>
                        </li>
                    ))}
                </MotionDiv>

                {/* Only show RazorpayCheckout button for Pro plan */}
                {id === 'pro' && (
                    <MotionDiv 
                        variants={listVariants}
                        className="space-y-2 flex justify-center w-full">
                        <div className="w-full">
                            <RazorpayCheckout 
                                planType={id as 'basic' | 'pro'}
                                amount={price}
                                planName={name}
                            />
                        </div>
                    </MotionDiv>
                )}

            </div>
        </MotionDiv>
    );
};

export default function PricingSection() {
    return(
        <MotionSection
            variants={containerVariants}
            initial='hidden'
            whileInView={"visible"}
            viewport={{once: true, margin: '-100px'}}
             className="relative overflow-hidden" id="pricing">
            <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-12">
                <MotionDiv 
                    variants={itemVariants}
                    className="flex items-center justify-center w-full pb-12">
                    <h2 className="uppercase font-bold text-xl mb-8 text-rose-500">Pricing</h2>
                </MotionDiv>
                <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8">
                    {plans.map((plan) => (
                        <PricingCard key={plan.id} {...plan} />
                    ))}
                </div>
            </div> 
        </MotionSection>
    );
}
