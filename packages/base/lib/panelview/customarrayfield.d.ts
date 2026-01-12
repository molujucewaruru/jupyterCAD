import React from 'react';
interface IProps {
    formData?: any[];
    name: string;
    required: boolean;
    schema: any;
    errorSchema?: {
        [key: string]: any;
    };
    onChange: (updatedValue: any[]) => void;
    onBlur: (name: string, value: any) => void;
}
declare const CustomArrayField: React.FC<IProps>;
export default CustomArrayField;
