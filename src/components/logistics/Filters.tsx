import type { FC } from "react";
import Card from "../commons/Card";
import Select from "../commons/form/Select";
import Input from "../commons/form/Input";

const Filters: FC = () => {
    const today = new Date().toISOString().split('T')[0];
    return (
        <Card>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Input name="" label="Fecha" type="date" defaultValue={today} />
                <Select label="Campo" items={[]} name="campo" placeholder="Filtrar por Campo" />
            </div>
        </Card>
    )
};

export default Filters;