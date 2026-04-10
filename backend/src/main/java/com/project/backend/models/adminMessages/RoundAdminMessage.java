package com.project.backend.models.adminMessages;

import com.project.backend.models.Round;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "round_admin_messages", schema = "tournament")
@DiscriminatorValue("ROUND")
@Getter
@Setter
@NoArgsConstructor
@PrimaryKeyJoinColumn(name = "id")
public class RoundAdminMessage extends AdminMessage {

    @ManyToOne
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;
}