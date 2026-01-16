import { Request, Response } from "express";
import { IFiscalReceiptService } from "../../Domain/services/IFiscalReceiptService";
import { IPDFService } from "../../Domain/services/IPDFService";

export class FiscalReceiptController {
    constructor(
        private readonly fiscalReceiptService: IFiscalReceiptService,
        private readonly pdfService: IPDFService
    ) {}

    createFiscalReceipt = async (req: Request, res: Response): Promise<void> => {
        try {
            const saleData = req.body;
            const receipt = await this.fiscalReceiptService.createFiscalReceipt(saleData);
            res.status(201).json(receipt);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    getAllReceipts = async (req: Request, res: Response): Promise<void> => {
        try {
            const receipts = await this.fiscalReceiptService.getAllReceipts();
            res.status(200).json(receipts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    getReceiptById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const receipt = await this.fiscalReceiptService.getReceiptById(id);

            if (!receipt) {
                res.status(404).json({ error: "Receipt not found" });
                return;
            }

            res.status(200).json(receipt);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    getReceiptByNumber = async (req: Request, res: Response): Promise<void> => {
        try {
            const receiptNumber = req.params.number;
            const receipt = await this.fiscalReceiptService.getReceiptByNumber(receiptNumber);

            if (!receipt) {
                res.status(404).json({ error: "Receipt not found" });
                return;
            }

            res.status(200).json(receipt);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    downloadReceiptPDF = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const receipt = await this.fiscalReceiptService.getReceiptById(id);

            if (!receipt) {
                res.status(404).json({ error: "Receipt not found" });
                return;
            }

            const pdfBuffer = await this.pdfService.generateFiscalReceiptPDF(receipt);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=receipt-${receipt.receiptNumber}.pdf`);
            res.send(pdfBuffer);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };
}
