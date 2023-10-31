'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const InvoiceSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    try {
        const { customerId, amount, status } = CreateInvoice.parse({
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status'),
        });
        const amountInCents = amount * 100;
        const date = new Date().toISOString().split('T')[0];

        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (err) {
        return { message: 'Database Error: Failed to Create Invoice.', err };
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

const UpdateInvoice = InvoiceSchema.omit({ date: true });

export async function updateInvoice(formData: FormData) {
    try {
        const { id, customerId, amount, status } = UpdateInvoice.parse({
            id: formData.get('id'),
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status'),
        });

        const amountInCents = amount * 100;

        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
            `;
    } catch (err) {
        return { message: 'Database Error: Failed to Update Invoice.', err };
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

const DeleteInvoice = InvoiceSchema.pick({ id: true });

export async function deleteInvoice(formData: FormData) {
    try {
        const { id } = DeleteInvoice.parse({
            id: formData.get('id'),
        });
        // const id = formData.get('id')?.toString();
        await sql`DELETE FROM invoices WHERE id = ${id}`;
    } catch (err) {
        return { message: 'Database Error: Failed to Delete Invoice.', err };
    }
    revalidatePath('/dashboard/invoices');
}
