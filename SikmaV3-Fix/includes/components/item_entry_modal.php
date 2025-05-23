<div id="itemEntryModal" class="modal item-entry-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="itemModalTitle"><i class="fas fa-plus-square"></i>Tambah Item</h3>
            <button type="button" class="close-btn" aria-label="Tutup Modal" data-modal-id="itemEntryModal">&times;</button>
        </div>
        <form id="itemEntryForm" novalidate>
            <input type="hidden" id="itemType" name="itemType">
            <input type="hidden" id="itemId" name="itemId"> <div id="commonFieldsModal">
                </div>

            <div id="modalSpecificFieldsContainer">
                <div id="skillFieldsTemplate" class="modal-fields-group" style="display:none;">
                    <div class="form-group">
                        <label for="modal_skill_name">Nama Keahlian/Framework/Tool:</label>
                        <input type="text" id="modal_skill_name" name="skill_name" required> </div>
                    <div class="form-group">
                        <label for="modal_skill_level">Tingkat Keahlian:</label>
                        <select id="modal_skill_level" name="skill_level" required>
                            <option value="">Pilih Tingkat</option>
                            <option value="Dasar">Dasar</option>
                            <option value="Pemula">Pemula</option>
                            <option value="Menengah">Menengah</option>
                            <option value="Mahir">Mahir</option>
                            <option value="Ahli">Ahli</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="modal_experience_duration">Lama Pengalaman/Menekuni:</label>
                        <input type="text" id="modal_experience_duration" name="experience_duration" placeholder="cth: 1 tahun, 6 bulan, 2 proyek">
                    </div>
                </div>
                <div id="educationFieldsTemplate" class="modal-fields-group" style="display:none;">
                    <div class="form-group">
                        <label for="modal_institution_name">Nama Institusi:</label>
                        <input type="text" id="modal_institution_name" name="institution_name" required>
                    </div>
                    <div class="form-group">
                        <label for="modal_degree">Gelar/Jenjang:</label>
                        <input type="text" id="modal_degree" name="degree" placeholder="cth: S1, D3, SMA/SMK">
                    </div>
                    <div class="form-group">
                        <label for="modal_field_of_study">Bidang Studi:</label>
                        <input type="text" id="modal_field_of_study" name="field_of_study" placeholder="cth: Teknik Informatika">
                    </div>
                     <div class="form-row">
                        <div class="form-group">
                            <label for="modal_education_start_date">Tanggal Mulai:</label>
                            <input type="month" id="modal_education_start_date" name="start_date">
                        </div>
                        <div class="form-group">
                            <label for="modal_education_end_date">Tanggal Selesai (atau perkiraan):</label>
                            <input type="month" id="modal_education_end_date" name="end_date">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="modal_education_description">Deskripsi Tambahan (Opsional):</label>
                        <textarea id="modal_education_description" name="description" rows="3"></textarea>
                    </div>
                </div>
                 <div id="experienceFieldsTemplate" class="modal-fields-group" style="display:none;">
                    <div class="form-group">
                        <label for="modal_company_name">Nama Perusahaan/Organisasi:</label>
                        <input type="text" id="modal_company_name" name="company_name" required>
                    </div>
                    <div class="form-group">
                        <label for="modal_job_title">Posisi/Jabatan:</label>
                        <input type="text" id="modal_job_title" name="job_title" placeholder="cth: Web Developer Intern" required>
                    </div>
                     <div class="form-row">
                        <div class="form-group">
                            <label for="modal_experience_start_date">Tanggal Mulai:</label>
                            <input type="month" id="modal_experience_start_date" name="start_date">
                        </div>
                        <div class="form-group">
                            <label for="modal_experience_end_date">Tanggal Selesai (kosong jika masih berlangsung):</label>
                            <input type="month" id="modal_experience_end_date" name="end_date">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="modal_experience_description">Deskripsi Pekerjaan/Proyek (Opsional):</label>
                        <textarea id="modal_experience_description" name="description" rows="4"></textarea>
                    </div>
                </div>
                <div id="socialLinkFieldsTemplate" class="modal-fields-group" style="display:none;">
                    <div class="form-group">
                        <label for="modal_platform_name">Platform:</label>
                         <select id="modal_platform_name" name="platform_name" required>
                            <option value="">Pilih Platform</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="GitHub">GitHub</option>
                            <option value="GitLab">GitLab</option>
                            <option value="Portfolio Website">Portfolio Website</option>
                            <option value="Behance">Behance</option>
                            <option value="Dribbble">Dribbble</option>
                            <option value="Twitter">Twitter/X</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="modal_url">URL Profil/Link:</label>
                        <input type="url" id="modal_url" name="url" placeholder="https://..." required>
                    </div>
                </div>
                <div id="industryPreferenceFieldsTemplate" class="modal-fields-group" style="display:none;">
                    <div class="form-group">
                        <label for="modal_industry_name">Nama Bidang Industri:</label>
                        <input type="text" id="modal_industry_name" name="industry_name" placeholder="cth: Fintech, E-commerce, Edukasi" required>
                    </div>
                     <small>Anda bisa menambahkan beberapa preferensi satu per satu.</small>
                </div>
            </div>
            
            <div id="itemModalMessage" class="auth-message" style="display:none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary close-btn-footer" data-modal-id="itemEntryModal">Batal</button>
                <button type="submit" class="btn btn-primary"><i class="fas fa-check-circle"></i>Simpan Item</button>
            </div>
        </form>
    </div>
</div>
