export function EmergencyInfo({ guideName, guidePhone, agencyName }: { guideName: string; guidePhone: string; agencyName: string }) {
    return (
        <div className="space-y-4 bg-red-50 p-4 rounded-md">
            <h2 className="text-xl font-bold text-red-600">Acil Durum Bilgileri</h2>
            <div className="text-sm">
                <p><strong>Rehber:</strong> {guideName}</p>
                <p><strong>Telefon:</strong> {guidePhone}</p>
                <p><strong>Acente:</strong> {agencyName}</p>
            </div>
        </div>
    );
}
