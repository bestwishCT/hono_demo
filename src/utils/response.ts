interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;       
}

export const createResponse = <T>(code: number, message: string, data: T): ApiResponse<T> => {
    return {
        code,
        message,
        data,
    };
};
