import api from './api';
import { getPendingReports, removePendingReport } from './map/utils/pendingReports';

// Build and submit a single pending report entry to the server.
export async function submitPendingReport(report) {
  const { fields = {}, photos = [], answers = [], noc_answers = [] } = report;

  const formData = new FormData();

  if (fields.crisis_id) formData.append('crisis_id', fields.crisis_id);
  formData.append('description',                fields.description ?? '');
  formData.append('nature_of_crisis',           fields.nature_of_crisis ?? '');
  formData.append('nature_of_crisis_category',  fields.nature_of_crisis_category ?? '');
  formData.append('damage_severity',            fields.damage_severity ?? '');
  formData.append('damage_datetime',
    fields.damage_datetime ? new Date(fields.damage_datetime).toISOString() : new Date().toISOString()
  );
  formData.append('infrastructure_name',        fields.infrastructure_name ?? '');
  formData.append('infrastructure_type',        fields.infrastructure_type ?? '');
  formData.append('infrastructureDescription',  fields.infrastructure_description ?? '');
  formData.append('debris',                     fields.debris ?? false);
  formData.append('infrastructure_latitude',    fields.infrastructure_latitude ?? '');
  formData.append('infrastructure_longitude',   fields.infrastructure_longitude ?? '');
  formData.append('street_address',             fields.street_address ?? '');
  formData.append('city',                       fields.city ?? '');
  formData.append('state_province',             fields.state_province ?? '');
  formData.append('country',                    fields.country ?? '');
  formData.append('answers',                    JSON.stringify(answers));
  formData.append('noc_answers',                JSON.stringify(noc_answers));
  formData.append('electricity_condition',      fields.electricity_condition ?? 'unknown');
  formData.append('health_services_rating',     fields.health_services_rating ?? 'unknown');
  formData.append('pressing_need',
    Array.isArray(fields.pressing_need) ? fields.pressing_need.join(', ') : (fields.pressing_need ?? '')
  );
  formData.append('annotations', JSON.stringify(fields.annotations ?? {}));

  photos.forEach((p) => {
    formData.append('photos', p.blob, p.name ?? 'photo.jpg');
  });
  formData.append('photoDescription', JSON.stringify(photos.map((p) => p.description ?? '')));

  await api.post('/impact-reports/', formData);
}

// Flush all pending reports. Returns { submitted, failed } counts.
export async function flushPendingReports() {
  const pending = await getPendingReports();
  let submitted = 0;
  let failed    = 0;

  for (const report of pending) {
    try {
      await submitPendingReport(report);
      await removePendingReport(report.id);
      submitted++;
    } catch {
      failed++;
    }
  }

  return { submitted, failed };
}
