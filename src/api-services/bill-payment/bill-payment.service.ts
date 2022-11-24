import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { AxiosRequestConfig } from "axios";
import { catchError, lastValueFrom, map } from "rxjs";
import { BillCategoryTypes } from "./interfaces/bill-payment.interface";
import { PayBillsDto } from "./dto/bill-payment.dto";

@Injectable()
export class BillPaymentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {}

  private readonly FLUTTERWAVE_BASE_URL = `https://api.flutterwave.com/v3`;

  public async getBillCategories(): Promise<any> {
    try {
      const flwReqOptions: AxiosRequestConfig = {
        method: "get",
        url: `${this.FLUTTERWAVE_BASE_URL}/bill-categories`,
        headers: {
          Authorization: `Bearer ${this.configService.get<string>(
            "FLUTTERWAVE_SECRET_KEY"
          )}`,
        },
      };

      return await lastValueFrom(
        this.httpService.request(flwReqOptions).pipe(
          map((res) => {
            return {
              status: res.data.status,
              message: res.data.message,
              data: res.data.data
                .filter((billCategory: any) => billCategory.country === "NG")
                .map((billCategory: any) => {
                  return {
                    name: billCategory.name,
                    type: billCategory.biller_name,
                    amount: billCategory.amount,
                    label: billCategory.label_name,
                  };
                }),
            };
          }),
          catchError((err) => {
            throw new HttpException(
              err.response.data.message,
              err.response.status
            );
          })
        )
      );
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? "SOMETHING WENT WRONG",
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getBillCategoryByType(
    billType: BillCategoryTypes
  ): Promise<any> {
    try {
      const flwReqOptions: AxiosRequestConfig = {
        method: "get",
        url: `${this.FLUTTERWAVE_BASE_URL}/bill-categories?${billType}=1`,
        headers: {
          Authorization: `Bearer ${this.configService.get<string>(
            "FLUTTERWAVE_SECRET_KEY"
          )}`,
        },
      };

      return await lastValueFrom(
        this.httpService.request(flwReqOptions).pipe(
          map((res) => {
            return {
              status: res.data.status,
              message: res.data.message,
              data: res.data.data
                .filter((billCategory: any) => billCategory.country === "NG")
                .map((billCategory: any) => {
                  return {
                    name: billCategory.name,
                    type: billCategory.biller_name,
                    amount: billCategory.amount,
                    label: billCategory.label_name,
                  };
                }),
            };
          }),
          catchError((err) => {
            throw new HttpException(
              err.response.data.message,
              err.response.status
            );
          })
        )
      );
    } catch (error) {
      console.error(error.message);
      throw new HttpException(
        error.message ?? "SOMETHING WENT WRONG",
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async payBills(createBillDto: PayBillsDto): Promise<any> {
    try {
      const { accountNumber, ...providerOptions } = createBillDto;

      const flwReqOptions: AxiosRequestConfig = {
        method: "post",
        url: `${this.FLUTTERWAVE_BASE_URL}/bills`,
        headers: {
          Authorization: `Bearer ${this.configService.get<string>(
            "FLUTTERWAVE_SECRET_KEY"
          )}`,
        },
        data: { ...providerOptions },
      };

      return await lastValueFrom(
        this.httpService.request(flwReqOptions).pipe(
          map((res) => res.data),
          catchError((err) => {
            throw new HttpException(
              err.response.data.message,
              err.response.status
            );
          })
        )
      );
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message ?? "SOMETHING WENT WRONG",
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
