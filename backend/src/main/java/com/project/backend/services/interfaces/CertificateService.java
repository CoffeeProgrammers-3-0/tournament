package com.project.backend.services.interfaces;

import com.project.backend.models.Certificate;
import com.project.backend.models.User;
import com.project.backend.models.constants.CertificateStatus;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface CertificateService {
    List<Certificate> generateCertificatesForTeams(User creator, Long templateId, Long roundId);
    List<Certificate> generateCertificatesForTeams(User creator,Long templateId, Long roundId, List<Long> teamIds);

    Certificate generateCertificate(User creator, User receiver, Long templateId, String fileName, Map<String, Object> data);

    Certificate updateCertificateStatus(Long id, CertificateStatus certificateStatus);
    Certificate getCertificateMetaById(Long id);

    Page<Certificate> findCertificatesByReceiver(Long userId, Integer page, Integer size);

    Page<Certificate> findCertificatesByCreator(Long userId, Integer page, Integer size);

    Page<Certificate> findAll(Integer page, Integer size);
}
