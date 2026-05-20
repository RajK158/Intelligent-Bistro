import { z } from "zod";
declare const AIResponseSchema: z.ZodObject<{
    reply: z.ZodString;
    actions: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            ADD_ITEM: "ADD_ITEM";
            REMOVE_ITEM: "REMOVE_ITEM";
            UPDATE_QUANTITY: "UPDATE_QUANTITY";
            CLEAR_CART: "CLEAR_CART";
            NONE: "NONE";
        }>;
        itemId: z.ZodOptional<z.ZodString>;
        quantity: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    suggestions: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type AIResponse = z.infer<typeof AIResponseSchema>;
export declare const OrderRequestSchema: z.ZodObject<{
    message: z.ZodString;
    cart: z.ZodArray<z.ZodAny>;
    history: z.ZodArray<z.ZodAny>;
}, z.core.$strip>;
export declare function processAIOrder(message: string, cart: unknown[], history: unknown[]): Promise<AIResponse>;
export {};
//# sourceMappingURL=aiOrder.d.ts.map